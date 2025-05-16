from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Device, Vulnerability
import time
import json
import requests
from urllib.parse import quote_plus

def vulns_search(model):
    model_url = quote_plus(model)

    vulns = []
    try:
        res = requests.get('https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=' + model_url)

        if res.status_code != 200:
            print("Error al acceder a la API: status =", res.status_code)
            return vulns  

        json_object = res.json()

    except requests.exceptions.RequestException as e:
        print("Error de conexión/HTTP:", e)
        return vulns
    except json.JSONDecodeError as e:
        print("Error decodificando JSON:", e)
        return vulns

    json_vulns = json_object.get("vulnerabilities", [])
    if not json_vulns:
        return vulns 

    for vul in range(len(json_vulns)):
        cve_data = json_vulns[vul]["cve"]
        if "descriptions" in cve_data and cve_data["descriptions"]:
            description = str(cve_data["descriptions"][0].get("value", "No description"))
        else:
            description = "No description"

        cve_id = str(cve_data.get("id", "NO_ID"))

        metrics = cve_data.get("metrics", {})
        version_info = str(metrics)

        def get_cwe_value(cve_dict):
            # cve_dict = cve_data
            weaknesses = cve_dict.get("weaknesses", [])
            if weaknesses and 'description' in weaknesses[0] and weaknesses[0]['description']:
                return weaknesses[0]['description'][0].get('value', 'N/A')
            return "N/A"

        cwe_value = get_cwe_value(cve_data)

        if "cvssMetricV31" in version_info:
            cvss31_data = metrics["cvssMetricV31"][0]
            version31 = str(cvss31_data["cvssData"].get("version", "N/A"))
            baseScore31 = str(cvss31_data["cvssData"].get("baseScore", "N/A"))
            severity31 = str(cvss31_data["cvssData"].get("baseSeverity", "N/A"))
            explotability31 = str(cvss31_data.get("exploitabilityScore", "N/A"))
            impact31 = str(cvss31_data.get("impactScore", "N/A"))
            vector31 = str(cvss31_data["cvssData"].get("vectorString", "N/A"))

            vulns.append(
                cve_id + "___" + description + "___" + severity31 + "___" + version31 + "___" +
                baseScore31 + "___" + explotability31 + "___" + impact31 + "___" + cwe_value + "___" + vector31
            )

        elif "cvssMetricV30" in version_info:
            cvss30_data = metrics["cvssMetricV30"][0]
            version30 = str(cvss30_data["cvssData"].get("version", "N/A"))
            baseScore30 = str(cvss30_data["cvssData"].get("baseScore", "N/A"))
            severity30 = str(cvss30_data["cvssData"].get("baseSeverity", "N/A"))
            explotability30 = str(cvss30_data.get("exploitabilityScore", "N/A"))
            impact30 = str(cvss30_data.get("impactScore", "N/A"))
            vector30 = str(cvss30_data["cvssData"].get("vectorString", "N/A"))

            vulns.append(
                cve_id + "___" + description + "___" + severity30 + "___" + version30 + "___" +
                baseScore30 + "___" + explotability30 + "___" + impact30 + "___" + cwe_value + "___" + vector30
            )

        elif "cvssMetricV2" in version_info:
            cvss2_data = metrics["cvssMetricV2"][0]
            version2 = str(cvss2_data["cvssData"].get("version", "N/A"))
            baseScore2 = str(cvss2_data["cvssData"].get("baseScore", "N/A"))
            severity2 = str(cvss2_data.get("baseSeverity", "N/A"))
            explotability2 = str(cvss2_data.get("exploitabilityScore", "N/A"))
            impact2 = str(cvss2_data.get("impactScore", "N/A"))
            vector2 = str(cvss2_data["cvssData"].get("vectorString", "N/A"))

            vulns.append(
                cve_id + "___" + description + "___" + severity2 + "___" + version2 + "___" +
                baseScore2 + "___" + explotability2 + "___" + impact2 + "___" + cwe_value + "___" + vector2
            )

    return vulns


@receiver(post_save, sender=Device)
def scan(sender, instance, created, **kwargs):
    if created:
        vulns = vulns_search(instance.model)
        for vul in vulns:
            parts = vul.split("___")
            if len(parts) == 9:
                Vulnerability.objects.create(
                    name=parts[0],
                    description=parts[1],
                    baseSeverity=parts[2],
                    version=parts[3],
                    cvss=parts[4],
                    explotability=parts[5],
                    impact=parts[6],
                    cwe=parts[7],
                    vector=parts[8],
                    device=instance
                )
            else:
                pass
