// Encrypts dashboard.json -> assets/vault.js (AES-256-GCM, PBKDF2-SHA256).
// Usage: VAULT_PASSWORD='...' node build-vault.mjs
// dashboard.json is gitignored; only ciphertext is published.
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as c } from "node:crypto";
const pw = process.env.VAULT_PASSWORD;
if (!pw) { console.error("Set VAULT_PASSWORD"); process.exit(1); }
const iter = 600000, salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
const base = await c.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
const key = await c.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const pt = new TextEncoder().encode(JSON.stringify(JSON.parse(readFileSync("dashboard.json", "utf8"))));
const ct = new Uint8Array(await c.subtle.encrypt({ name: "AES-GCM", iv }, key, pt));
const b = (u) => Buffer.from(u).toString("base64");
writeFileSync("assets/vault.js", `window.VAULT=${JSON.stringify({ iter, salt: b(salt), iv: b(iv), ct: b(ct) })};\n`);
console.log("wrote assets/vault.js");
