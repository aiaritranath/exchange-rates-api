# 💱 Exchange Rates API

A lightweight currency exchange-rate API built with **Node.js** and **Vercel Serverless Functions**. It proxies requests to a configurable exchange-rate provider, protects the endpoint with an API key, and returns a simplified JSON response.

The repository also includes a small browser-based dashboard for looking up rates by base currency.

## ✨ Features

- **API-key authentication** using the `x-api-key` request header.
- **Configurable upstream provider** via the `UPSTREAM_RATES_URL` environment variable.
- **Choose a base currency** with the `base` query parameter, such as `USD`, `EUR`, or `INR`.
- **Simplified JSON response** with the base currency, update timestamps, and rates.
- **Edge caching on Vercel** for 10 minutes, with stale responses allowed while revalidating.
- **Browser dashboard** to enter an API key and browse rates.
- **CORS support** for browser-based requests from other origins.
- A small security header, `X-Content-Type-Options: nosniff`, configured for API routes.

## 🧰 Tech Stack

- Node.js 20 or newer
- JavaScript ES modules
- Vercel Serverless Functions
- HTML, CSS, and vanilla JavaScript for the dashboard

## 📁 Project Structure

```text
exchange-rates-api/
├── api/
│   └── rates.js        # Authenticated exchange-rates endpoint
├── public/
│   └── index.html      # Browser dashboard
├── .gitignore
├── package.json
└── vercel.json         # Vercel configuration and API headers
```

## 🚀 Getting Started

### 1. Requirements

Install:

- [Node.js](https://nodejs.org/) version 20 or newer
- [Vercel CLI](https://vercel.com/docs/cli)

Install the Vercel CLI globally if you do not already have it:

```bash
npm install -g vercel
```

### 2. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/exchange-rates-api.git
cd exchange-rates-api
```

Replace `YOUR_USERNAME` with the GitHub account or organization that hosts the repository.

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
API_KEY=replace_with_a_long_random_secret
UPSTREAM_RATES_URL=https://open.er-api.com/v6/latest/USD
```

- `API_KEY` is the secret clients must provide to access this endpoint.
- `UPSTREAM_RATES_URL` is the upstream endpoint used to fetch exchange rates. The example uses the open.er-api.com endpoint for USD rates. The application replaces the final path segment with the requested base currency.

Use a strong, unique API key. Do not commit `.env.local` or publish secrets in your repository.

### 4. Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by the Vercel CLI, usually `http://localhost:3000`.

The dashboard is served from `public/index.html`. Enter the API key you configured and a three-letter base currency code, then select **Get Rates**.

## 🔌 API Reference

### Get exchange rates

```http
GET /api/rates
```

#### Headers

| Header | Required | Description |
|---|---|---|
| `x-api-key` | Yes | API key matching the server's `API_KEY` environment variable. |

#### Query parameters

| Parameter | Required | Description |
|---|---|---|
| `base` | No | Three-letter base currency code, for example `USD`, `EUR`, or `INR`. Defaults to the base currency configured in `UPSTREAM_RATES_URL`. |

### Example request with cURL

```bash
curl "http://localhost:3000/api/rates?base=EUR" \
  -H "x-api-key: replace_with_a_long_random_secret"
```

For a deployed project, replace `http://localhost:3000` with your Vercel deployment URL.

### Example successful response

```json
{
  "result": "success",
  "creator": "Aritra Nath",
  "instagram": "@its_aritra_nath",
  "base_code": "EUR",
  "last_updated_utc": "Mon, 01 Jan 2026 00:00:01 +0000",
  "next_update_utc": "Tue, 02 Jan 2026 00:00:01 +0000",
  "rates": {
    "EUR": 1,
    "USD": 1.04,
    "INR": 90.5
  }
}
```

The timestamps and rate values above are illustrative. Actual values depend on the upstream provider and the latest data it returns.

### Error responses

The endpoint returns JSON errors for common failures:

| HTTP status | Meaning |
|---|---|
| `401` | The API key is missing or invalid. |
| `405` | The request method is not supported; use `GET`. |
| `500` | A required server environment variable is missing. |
| `502` | The upstream provider could not be reached or returned a non-success HTTP status. |

An `OPTIONS` request is supported for CORS preflight and returns `204 No Content`.

## 🌐 Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. In **Project Settings → Environment Variables**, add:
   - `API_KEY` — your private API key.
   - `UPSTREAM_RATES_URL` — for example, `https://open.er-api.com/v6/latest/USD`.
4. Deploy or redeploy the project so the environment variables take effect.
5. Test the deployed endpoint:

```bash
curl "https://YOUR_PROJECT.vercel.app/api/rates?base=USD" \
  -H "x-api-key: YOUR_API_KEY"
```

Replace `YOUR_PROJECT` and `YOUR_API_KEY` with your deployment hostname and configured key. Keep the API key private.

## 🔐 Security Notes

- Keep `API_KEY` and any provider credentials in environment variables; never hard-code secrets in source code.
- Prefer the `x-api-key` header rather than the optional `?key=...` query parameter. Query parameters can be captured in browser history, analytics, and server logs.
- The included dashboard stores the entered API key in that browser's `localStorage` so it can be reused. Do not save a sensitive key on a shared or untrusted device; clear the key from browser storage when finished.
- The endpoint currently allows requests from any origin through `Access-Control-Allow-Origin: *`. CORS is not authentication; the API key is still required. For a public production service, consider restricting origins, adding rate limiting, monitoring usage, and rotating keys if exposed.
- Avoid committing `.env.local`, deployment secrets, or any credential-containing files.

## ⚙️ Configuration

| Variable | Required | Description |
|---|---|---|
| `API_KEY` | Yes | Secret used to authenticate requests. |
| `UPSTREAM_RATES_URL` | Yes | Complete upstream URL including the default base currency as its last path segment, e.g. `https://open.er-api.com/v6/latest/USD`. |

The API sets `Cache-Control: public, s-maxage=600, stale-while-revalidate=1200` on successful responses. Rates may therefore be cached at Vercel's edge for up to 10 minutes, with stale content available during revalidation.

## 🤝 Contributing

Contributions, fixes, and suggestions are welcome. For substantial changes, open an issue first to discuss the proposed update.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes locally.
4. Open a pull request with a clear description.

## 📄 License

No license file is included in this repository yet. Add a `LICENSE` file before distributing the project under a specific open-source license.

## 👨‍💻 Creator

**Aritra Nath**  
Instagram: [@its_aritra_nath](https://instagram.com/its_aritra_nath)
