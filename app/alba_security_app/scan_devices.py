# scan_devices.py
import json
import threading
import requests
from scapy.all import sniff, IP, traceroute
import time
from devices import token_ha, api_key_abuse, url, dispositivos, red, get_device_name_by_ip, create_connection, create_device, Dispositivo, log_creations
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "alba_security_proj.settings")
django.setup()

from alba_security_app.models import Device

HOME_ASSISTANT_WEBHOOK = f"{url}/api/events/ips_scan"
ABUSEIPDB = 'https://api.abuseipdb.com/api/v2/check'


conexiones_externas = set()
ips_sospechosas = set()
rastros_conexion = {}
escaneo_activado = True
RED_LOCAL = red.split(".")[0] + "." + red.split(".")[1]

connection_pairs = set()


def is_multicast(ip):
    first_octet = int(ip.split('.')[0])
    return 224 <= first_octet <= 239

def check_ips(ip):
    querystring = {
        'ipAddress': ip,
        'maxAgeInDays': '90'
    }
    headers = {
        'Accept': 'application/json',
        'Key': api_key_abuse 
    }
    response = requests.get(ABUSEIPDB, headers=headers, params=querystring)
    return json.loads(response.text)

def enviar_alerta(mensaje):
    try:
        headers = {
            "Authorization": f"Bearer {token_ha}",
            "Content-Type": "application/json"
        }
        data = {"message": mensaje}
        requests.post(HOME_ASSISTANT_WEBHOOK, json=data, headers=headers)
    except Exception as e:
        print(f"Error sending alert: {e}")

def analiza_conexiones(dispositivos):
    def gestionar_alerta(ip, dispositivo_ip, trace_ip):
        trace_names = [get_device_name_by_ip(hop) for hop in trace_ip]
        trace_reversed = list(reversed(trace_names))
        if ip not in conexiones_externas:
            conexiones_externas.add(ip)

            mensaje_ips = f"{dispositivo_ip} connected to {ip} | Trace: {' -> '.join(trace_ip)}"
            print(mensaje_ips)

            isRouter = False
            create_device(Dispositivo(name="/exterior/", ip=" ", sw_version=" ", manufacturer=" ", model="/exterior/"))
            res = [c for c in trace_names if not c.replace('.', '').isdigit()]

            for i in trace_reversed:
                if (i.startswith("10.") or i.startswith("172.") or i.startswith("192.168.")):
                    if not isRouter:
                        create_device(Dispositivo(name="/router/", ip=i, sw_version=" ", manufacturer=" ", model="/router/"))
                        isRouter = True
                    elif i != trace_reversed[-1]:
                        create_device(Dispositivo(name="/acces point/", ip=i, sw_version=" ", manufacturer=" ", model="/ap/"))
                        res.append("/ap/")
            if isRouter: res.append("/router/")
            res.append("/exterior/")

            mensaje_nombres = f"INTERNAMES: {'->'.join(res)}"
            print(mensaje_nombres)                

            for i in range(len(res) - 1):
                pair = tuple(sorted((res[i], res[i + 1])))
                connection_pairs.add(pair)


            enviar_alerta(mensaje_ips) 

            res = check_ips(ip)
            try:
                ipAddress = res['data']['ipAddress']
                abuseConfidenceScore = res['data']['abuseConfidenceScore']
                if abuseConfidenceScore > 70:
                    ips_sospechosas.add(ip)
                    msg_maliciosa = f"Possible malicious IP detected: {ip}"
                    enviar_alerta(msg_maliciosa)
            except:
                pass

    def realizar_traceroute(ip, dispositivo_ip):
        try:
            if not is_multicast(ip):
                result, _ = traceroute(ip, maxttl=30, timeout=2, verbose=0)
                dicchops = result.get_trace().get(ip, {})
                trace_ip = [hop_info[0] for hop_info in dicchops.values()]
                trace_ip.insert(0,dispositivo_ip)
        except Exception as e:
            trace_ip = [dispositivo_ip, f"Error: {str(e)}"]

        rastros_conexion[ip] = trace_ip
        gestionar_alerta(ip, dispositivo_ip, trace_ip)

    def procesar_paquete(paquete):
        if not escaneo_activado or IP not in paquete:
            return
        ip_origen = paquete[IP].src
        ip_destino = paquete[IP].dst

        for d in dispositivos:
            if ip_origen == d.ip and not ip_destino.startswith(RED_LOCAL) and ip_destino != d.ip:
                if ip_destino not in rastros_conexion:
                    threading.Thread(target=realizar_traceroute, args=(ip_destino, d.ip)).start()
                else:
                    trace_ya = rastros_conexion[ip_destino]
                    gestionar_alerta(ip_destino, d.ip, trace_ya)
            elif ip_destino == d.ip and not ip_origen.startswith(RED_LOCAL) and ip_origen != d.ip:
                if ip_origen not in rastros_conexion:
                    threading.Thread(target=realizar_traceroute, args=(ip_origen, d.ip)).start()
                else:
                    trace_ya = rastros_conexion[ip_origen]
                    gestionar_alerta(ip_origen, d.ip, trace_ya)

    to = 25
    sniff(filter="ip", prn=procesar_paquete, store=False, timeout=to)
    print(f"Scan stopped after {to} seconds.")

def iniciar_escaneo():
    global escaneo_activado
    escaneo_activado = True

    print(f"Scan started for {len(dispositivos)} devices.")
    analiza_conexiones(dispositivos)

    for a, b in connection_pairs:
        create_connection(a,b)
        log_creations["con"].append((a,b))
    
    print(f"Added devices {log_creations["dev"]}")
    print(f"Added connections {log_creations["con"]}")


iniciar_escaneo()