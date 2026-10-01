# Countdown

Split-Flap-Countdown (React), läuft als Docker-Container hinter Traefik unter
https://count.himmelreich.cloud.

## Parameter

- `?date=2029-03-29T16:00` Zieldatum (Standard: 29.03.2029 16:00)
- `?titel=Restdienstzeit` Überschrift

Liegt das Datum in der Vergangenheit, zählt die Anzeige hoch.
Die Schriftart wählst du über das Zahnrad unten rechts.

## Deployment

```bash
cd /home/me/node/countdown
git pull
docker compose up -d --build
```

Der Container hängt im externen `proxy`-Netzwerk; Traefik routet über die
Labels in `docker-compose.yml`. Healthcheck: `/health`.

## Entwicklung

```bash
npm ci --legacy-peer-deps
npm start
```
