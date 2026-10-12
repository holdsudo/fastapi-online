# fastapi.online

Static GitHub Pages site. The root (and every unknown path, via `404.html`) looks like a plain 404 with a compliance footer: SMS opt-in (name, mobile, unchecked consent box with STOP/HELP/rates/frequency language), Privacy Policy, Terms, SMS Terms, Accessibility, Do-Not-Sell/GPC notice.

Hidden entry: **click the "404"**. That opens a sign-in dialog; the password decrypts the project dashboard in the browser (AES-256-GCM, PBKDF2-SHA256 600k). Username is cosmetic. Only ciphertext (`assets/vault.js`) is in the repo — `dashboard.json` is gitignored.

## Edit the dashboard
    edit dashboard.json
    VAULT_PASSWORD="$(cat ~/.fastapi-online-dashboard-password)" node build-vault.mjs
    commit + push assets/vault.js

Change the password by running the same with a new `VAULT_PASSWORD`.

## Before using for 10DLC
Replace every `[PLACEHOLDER]` (business name, address, phone, email, program name, message types, frequency, governing-law state, effective date) in `index.html`, `404.html` and the four legal pages, and set `formEndpoint` in `assets/config.js` (e.g. Formspree). Until then the form refuses submissions instead of pretending to accept them.

Status dots are reachability only (no-cors fetch) — a Cloudflare 502 still shows green.
