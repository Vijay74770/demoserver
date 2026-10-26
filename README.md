# Sensor Server

Node.js + Express API that receives temperature/humidity readings from a
controller (ESP32/ESP8266/Arduino, etc.), stores them in PostgreSQL, and
serves the latest reading back over HTTP. Database runs on Supabase,
API runs on Render.

## Project structure

```
config/
  db.js            PostgreSQL connection pool (reads DATABASE_URL)
  initDb.js        One-off script that creates the `readings` table
middleware/
  auth.js          Shared-secret (x-api-key) check for the POST route
  errorHandler.js  Central error handler
controllers/
  readingsController.js  Request handlers: createReading, getLatestReading, getReadings
routes/
  readingsRoutes.js       Maps /api/readings routes to controller functions
server.js          App entrypoint: wires middleware + routes together
```

## Endpoints

| Method | Path                  | Purpose                              |
|--------|-----------------------|---------------------------------------|
| POST   | `/api/readings`        | Insert a new temperature/humidity reading |
| GET    | `/api/readings/latest` | Get the most recent reading |
| GET    | `/api/readings?limit=N`| Get the last N readings (default 50, max 500) |

### POST /api/readings

```
POST /api/readings
Content-Type: application/json
x-api-key: <DEVICE_API_KEY>   (only required if DEVICE_API_KEY is set)

{
  "temperature": 27.4,
  "humidity": 61.2
}
```

Response `201`:
```json
{ "id": 1, "temperature": "27.4", "humidity": "61.2", "recorded_at": "2026-10-26T10:00:00.000Z" }
```

### GET /api/readings/latest

```json
{ "id": 1, "temperature": "27.4", "humidity": "61.2", "recorded_at": "2026-10-26T10:00:00.000Z" }
```

## 1. Set up the database on Supabase

1. Create a project at https://supabase.com.
2. Project Settings -> Database -> Connection string -> copy the **URI**
   (use the "Connection pooling" one, port `6543`, when you deploy to Render).
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to that string.
4. Create the table:
   ```
   npm install
   npm run init-db
   ```
   This creates the `readings` table (id, temperature, humidity, recorded_at).

## 2. Run locally

```
npm install
npm run dev
```

Test it:
```
curl -X POST http://localhost:3000/api/readings -H "Content-Type: application/json" -d "{\"temperature\":25.5,\"humidity\":55}"
curl http://localhost:3000/api/readings/latest
```

## 3. Deploy the API to Render

1. Push this folder to a GitHub repo.
2. On https://render.com: New -> Web Service -> connect the repo.
3. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: add `DATABASE_URL` (the Supabase connection string)
     and optionally `DEVICE_API_KEY`. Do **not** set `PORT` — Render provides it.
4. Deploy. Render gives you a public URL like `https://your-service.onrender.com`.
5. Run the table creation once against the deployed DB (locally, pointed at the
   same `DATABASE_URL`, run `npm run init-db` — you only need to do this once,
   not on every deploy).

Your endpoints are then:
- `POST https://your-service.onrender.com/api/readings`
- `GET  https://your-service.onrender.com/api/readings/latest`

## 4. Example: posting from a controller (ESP32/Arduino, pseudo-code)

```cpp
HTTPClient http;
http.begin("https://your-service.onrender.com/api/readings");
http.addHeader("Content-Type", "application/json");
http.addHeader("x-api-key", "your-device-api-key"); // if DEVICE_API_KEY is set
String body = "{\"temperature\":" + String(temp) + ",\"humidity\":" + String(hum) + "}";
int code = http.POST(body);
```

## Notes

- `DEVICE_API_KEY` is optional shared-secret auth for the POST endpoint so
  random internet traffic can't write fake readings. Leave it unset to
  disable auth (fine for a quick test, not recommended once it's public).
- Free Render web services spin down when idle and take a few seconds to
  wake on the next request — expect a cold-start delay on the controller's
  first POST after inactivity.
