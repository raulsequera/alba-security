ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache python3 py3-pip nodejs npm nmap

WORKDIR /app

VOLUME /data

RUN python3 -m venv venv

COPY run.sh /
COPY requirements.txt /
COPY app /app/
COPY config.yaml /app/
RUN chmod a+x /run.sh


RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install --no-cache-dir python-nmap
RUN /app/venv/bin/pip install --no-cache-dir scapy
RUN /app/venv/bin/pip install -r /requirements.txt

WORKDIR /app/alba_security_frontend
RUN npm install --legacy-peer-deps
RUN npm install react-icons --legacy-peer-deps

CMD ["/run.sh"]
