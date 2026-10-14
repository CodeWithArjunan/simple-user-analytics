# Trailhead User Analytics

A full-stack demo that records visitor page views and clicks, groups events into browser sessions, and displays session journeys and page click positions.

## Features

- A reusable client tracker records `page_view` and `click` events.
- Session IDs persist in browser local storage.
- Click records include viewport x/y coordinates and viewport dimensions.
- An Express API stores events in MongoDB and exposes session, journey, page, and click endpoints.
- The dashboard shows session totals, ordered journeys, and a visual click map.
- A sample storefront at `/demo` generates data for the dashboard.

## Tech stack

React, Vite, Node.js, Express, MongoDB, and Mongoose.

## Requirements

- Node.js 20 or newer with npm
- MongoDB running locally or a MongoDB Atlas connection string

## Run locally

1. In this directory, install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your MongoDB connection string. The default connects to a local database named `user_analytics`.

3. Start both the API and frontend:

   ```bash
   npm run dev
   ```

4. Open the dashboard at [http://localhost:5173](http://localhost:5173). Open [http://localhost:5173/demo](http://localhost:5173/demo) in another tab and click around. Return to the dashboard and select **Refresh data**.

The API listens at `http://localhost:4000`. The Vite development server proxies `/api` requests to it.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/events` | Validate and store one page view or click event |
| `GET` | `/api/sessions` | List sessions with event counts and last-seen time |
| `GET` | `/api/sessions/:sessionId/events` | Get a session's events in timestamp order |
| `GET` | `/api/pages` | List page URLs with recorded events |
| `GET` | `/api/clicks?pageUrl=<encoded-url>` | Get click coordinates for a page |
| `GET` | `/api/health` | Check API and MongoDB connection status |

## Event format

```json
{
  "sessionId": "browser-session-id",
  "type": "click",
  "pageUrl": "https://example.com/shop",
  "timestamp": "2026-10-12T09:00:00.000Z",
  "x": 240,
  "y": 180,
  "viewportWidth": 1440,
  "viewportHeight": 900
}
```

For a `page_view`, the coordinate and viewport fields are omitted. The tracker is implemented in `client/src/tracker.js`; call `trackPageView()` on page load and install `startClickTracking()` to record clicks.

## Assumptions and trade-offs

- A session is a browser installation represented by a local-storage UUID. It persists until local storage is cleared; no timeout-based session expiry is applied.
- Click coordinates are CSS pixels relative to the browser viewport, not document coordinates. The heatmap scales each point against the viewport dimensions saved with that event.
- Page URLs include their full query string and fragment, so URL variants may appear as separate pages.
- The demo prioritizes the requested event flow over production analytics concerns. It does not include authentication, consent management, bot filtering, event batching, retention rules, or rate limiting.
- CORS is open by default for local development. Set `CLIENT_ORIGIN` to the deployed frontend origin(s) before exposing the API.

## Production build

```bash
npm run build
npm start
```

Set `VITE_API_URL` at client build time if the API is hosted on a different origin. Deploy the frontend static build and Node API separately, and configure MongoDB plus the frontend origin in the server environment.
