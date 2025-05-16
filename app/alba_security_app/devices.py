import requests
import os
import subprocess
import ipaddress
import socket
import time
import django
import sys
import json 

## Comentar para debug
original_stdout = sys.stdout
sys.stdout = open(os.devnull, 'w')
##

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "alba_security_proj.settings")
django.setup()

from alba_security_app.models import Device, Connection
import re
from django.db.models import Q

import yaml

token_ha = ""
api_key_abuse = ""
url = ""

def cargar_configuracion():
    global token_ha, api_key_abuse, url
    ruta_config = "/app/config.yaml"

    with open(ruta_config, "r") as f:
        config = yaml.safe_load(f)

    token_ha = config.get("options", {}).get("token_ha")
    api_key_abuse = config.get("options", {}).get("api_key_abuse")
    url = config.get("options", {}).get("url")

cargar_configuracion()


url_api_devices = "http://homeassistant.local:8000/alba/api/v1/devices/"
url_api_createconnection = "http://homeassistant.local:8000/alba/api/v1/createconnection/"

headers_api = {"Content-Type": "application/json"}

url = f"{url}/api/devices_api/devices"
headers = {
    "Authorization": f"Bearer {token_ha}",
    "content-type": "application/json",
}

response = requests.get(url, headers=headers)
data = response.json().get("data")

dispositivos = []
log_creations = dict(dev=list(), con=list())

class Dispositivo:
    def __init__(self, name, ip, sw_version, manufacturer, model, connected=False):
        self.name = name
        self.ip = ip
        self.sw_version = sw_version
        self.manufacturer = manufacturer
        self.model = model
        self.connected = connected

    def mostrar_info(self):
        return (
            f"Dispositivo {self.name} con IP: {self.ip}, "
            f"Versión de software: {self.sw_version}, "
            f"Marca: {self.manufacturer}, "
            f"Modelo: {self.model}, "
            f"¿Está connected? {self.connected}"
        )


def obtener_ip_local():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    ip_local = s.getsockname()[0]
    return ip_local

def obtener_red_ip(ip_local):
    ip = ipaddress.IPv4Interface(f'{ip_local}/24')
    red = str(ip.network.network_address)
    trozos = red.split('.')
    trozos[-1] = "1"
    red = '.'.join(trozos)
    return red + '/24'

def escanea_red(red):
    ips = []
    command = f"nmap -sn -n {red}" 
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    start_time = time.time()
    while True:
        if process.poll() is not None:
            break
        elif time.time() - start_time > 20:
            print("Timeout Exception")
            process.terminate()  
            break
        time.sleep(0.1)

    stdout, stderr = process.communicate()
    if process.returncode != 0:
        print(f"Error al ejecutar nmap: ")
        print(stderr.decode('utf-8', errors='replace'))
        return
    else:
        res = stdout.decode('utf-8', errors='replace')
        res = res.split("Nmap scan report for ")[1:-1]
        for i in res:
            ip = i.split("\n")[0].strip()
            disp = i.split("MAC Address: ")[1]
            ips.append((ip, disp))
        return ips

def asigna_ips(escaneo):
    if escaneo:
        for d in dispositivos:
            for e in escaneo:
                if d.manufacturer in e[1]:
                    d.ip = e[0]
                    d.connected = True



################ GESTIÓN DE DISPOSITIVOS ###############
def device_exists(model):
    try:
        response = requests.get(url_api_devices, headers=headers_api)
        if response.status_code == 200:
            devices = response.json()
            for device in devices:
                if device["model"] == model:
                    return True
        return False
    except Exception as e:
        print(f"Error al verificar si el dispositivo existe: {e}")
        return False


def create_device(device):
    if isinstance(device, Dispositivo):
        model = device.model
        data = {
            "model": device.model,
            "name": device.name,
            "ip": device.ip,
            "sw_version": device.sw_version,
            "manufacturer": device.manufacturer,
            "type": "Other",
            "category": "Unconstrained"
        }
    elif isinstance(device, dict):
        model = device["model"]
        data = device
    else:
        # print("Error: Tipo de dispositivo no soportado.")
        return None

    if device_exists(model):
        # print(f"Dispositivo {model} ya existe, omitiendo creación.")
        return None
    else:
        # print(f"Enviando solicitud POST a {url_api_devices} con datos: {data}")
        response = requests.post(url_api_devices, json=data, headers=headers_api)
        # print(f"Respuesta de la API: {response.status_code} - {response.text}")
        if response.status_code == 201:
            log_creations["dev"].append(model)
            return response.json()
        else:
            # print(f"Error al crear el dispositivo: {response.status_code}")
            return None

def get_device_name_by_ip(ip):
    for device in dispositivos:
        if device.ip == ip:
            return device.name
    return ip

def device_to_dict(device):
    return {
        "model": device.model,
        "type": device.type,
        "category": device.category
    }

################ GESTIÓN DE CONEXIONES ###############
    
def create_connection(d1, d2):
    if Connection.objects.filter(
        Q(first_device__model=d1, second_device__model=d2)
    ).exists():
        # print(f"La conexión {d1} ↔ {d2} ya existe, se omite la creación.")
        return None

    connection = {"type": "WI-FI", "first_device": d1, "second_device": d2}
    # print(f"Enviando solicitud POST a {url_api_createconnection} con datos: {connection}")

    response = requests.post(url_api_createconnection, json=connection, headers=headers_api)
    # print(f"Respuesta de la API: {response.status_code} - {response.text}")

    if response.status_code == 201:
        return response.json()
    else:
        # print(f"Error al crear la conexión: {response.status_code}")
        return None
        
######################################################

def parse_name(device_name):
    cleaned_name = re.sub(r'[\[\]().,]', '', device_name.lower()).strip()
    # Para el caso de dispositivos Apple
    cleaned_name = re.sub(r'\sde\s.*', '', cleaned_name)
    return cleaned_name


for e in data:
    if e.get("type") is None or e.get("type") != "service":
        dispositivo = Dispositivo(
            e.get("name"),
            e.get("ip"),
            e.get("sw_version"),
            e.get("manufacturer"),
            e.get("model"),
        )
        dispositivos.append(dispositivo)    
ip_local = obtener_ip_local()
red = obtener_red_ip(ip_local)
print(f"Buscando dispositivos en la red: {red} ....")
escaneo = escanea_red(red)
asigna_ips(escaneo)
for i in dispositivos:
    print(i.mostrar_info())
    
for i in dispositivos:
    disp = Device(model=parse_name(i.name), type="Other", category="Unconstrained")
    disp_dict = device_to_dict(disp)
    resultado = create_device(disp_dict)
    if resultado:
        print(f"Dispositivo creado: {resultado}")
    else:
        print("No se pudo crear el dispositivo.")
    

## Comentar para debug
sys.stdout = original_stdout
##

print(f'Devices imported {log_creations["dev"]}')
