# Cloudflare Worker Quota Protection

This package can run as a Cloudflare Worker, but Worker code is not the primary place to save Worker request quota. Once Worker code runs, the request has already invoked the Worker.

Use Cloudflare routing and WAF controls before Worker execution.

## Worker Route

Attach the Worker only to the exact API route.

```txt
example.com/api/syllable
```

Do not attach it to broad routes:

```txt
example.com/*
example.com/api/*
```

For production, disable or do not use the broad `workers.dev` endpoint unless it is protected separately.

## WAF Custom Rules

Create WAF Custom Rules for the exact endpoint before relying on Worker backup checks.

Block non-GET requests:

```txt
http.request.uri.path eq "/api/syllable"
and http.request.method ne "GET"
```

Block requests without the required query parameter:

```txt
http.request.uri.path eq "/api/syllable"
and not http.request.uri.query contains "word="
```

Optionally block oversized query strings:

```txt
http.request.uri.path eq "/api/syllable"
and len(http.request.uri.query) gt 96
```

Use action `Block` for these rules.

## WAF Rate Limiting

Add a WAF Rate Limiting Rule for `/api/syllable`.

Recommended starting point:

```txt
Expression:
http.request.uri.path eq "/api/syllable"
and http.request.method eq "GET"

Limit:
10 requests per 10 seconds per IP

Action:
Block

Mitigation timeout:
5 minutes
```

Tune the threshold from Cloudflare Analytics after real traffic is visible.

## Worker Backup Guards

The Worker entrypoint still validates:

- path must be `/api/syllable`
- method must be `GET`
- `word` must be present and non-empty after normalization
- raw `word` length must be at most 64 characters

These checks protect correctness and error shape. They do not reduce Worker invocation usage.

## Deployment

Build the Worker:

```bash
npm run build:worker
```

Copy `wrangler.jsonc.example` to `wrangler.jsonc`, replace `example.com`, then deploy with Wrangler from your own Cloudflare-authenticated environment.

Do not commit account-specific IDs, tokens, or secrets.
