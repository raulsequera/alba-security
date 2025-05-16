#!/usr/bin/with-contenv bashio
set -e 

bashio::log.info "Iniciando Alba Security..."

export PYTHONPATH=/app

source /app/venv/bin/activate

if [ ! -f /data/db.sqlite3 ]; then
    bashio::log.info "Copiando db.sqlite3 a /data..."
    cp /app/db.sqlite3 /data/db.sqlite3
fi

bashio::log.info "Aplicando migraciones de la base de datos..."
/app/venv/bin/python /app/manage.py migrate

bashio::log.info "Iniciando backend en 0.0.0.0:8000"
cd /app
/app/venv/bin/python /app/manage.py runserver 0.0.0.0:8000 &


bashio::log.info "Iniciando frontend en http://0.0.0.0:5173"
cd /app/alba_security_frontend
ip a
npm run dev &

wait