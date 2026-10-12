(function () {
  var $ = function (id) { return document.getElementById(id); };
  $("yr").textContent = new Date().getFullYear();

  // --- opt-in form ---
  $("optin").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, msg = $("optin-msg");
    if (!f.name.value.trim() || f.phone.value.replace(/\D/g, "").length < 10) { msg.textContent = "Please enter your name and a valid mobile number."; return; }
    if (!f.terms_consent.checked) { msg.textContent = "Please agree to the Terms of Service and Privacy Policy."; return; }
    var ep = (window.SITE_CONFIG || {}).formEndpoint;
    if (!ep) { msg.textContent = "Sign-up is not available at this time. Please try again later."; return; }
    var data = new FormData(f);
    data.append("consent_text", f.sms_consent.parentNode.textContent.trim());
    data.append("submitted_at", new Date().toISOString());
    data.append("page", location.href);
    fetch(ep, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; f.reset(); msg.textContent = "Thank you. Your information has been received."; })
      .catch(function () { msg.textContent = "Something went wrong. Please try again later."; });
  });

  // --- hidden entry: click the 404 ---
  var dlg = $("login");
  $("code").addEventListener("click", function () { $("login-err").textContent = ""; dlg.showModal(); });
  $("login-cancel").addEventListener("click", function () { dlg.close(); });

  var b64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  async function unlock(pw) {
    var v = window.VAULT, enc = new TextEncoder();
    var base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(v.salt), iterations: v.iter, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    var pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(v.iv) }, key, b64(v.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }

  $("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var go = $("login-go"); go.disabled = true;
    try { var d = await unlock(e.target.p.value); dlg.close(); e.target.reset(); render(d); }
    catch (_) { $("login-err").textContent = "Invalid username or password."; }
    go.disabled = false;
  });

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function render(d) {
    var dash = $("dash"); dash.textContent = "";
    var wrap = el("div", "dash-in"), top = el("div", "dash-top");
    top.appendChild(el("h2", null, d.title || "Projects"));
    var out = el("button", "ghost", "Sign out"); out.onclick = function () { dash.hidden = true; dash.textContent = ""; };
    top.appendChild(out); wrap.appendChild(top);
    var grid = el("div", "grid");
    (d.projects || []).forEach(function (p) {
      var a = el("a", "card"); a.href = p.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      var h = el("div", "card-h"), dot = el("span", "dot"); h.appendChild(dot); h.appendChild(el("span", null, p.name));
      a.appendChild(h);
      if (p.desc) a.appendChild(el("p", null, p.desc));
      a.appendChild(el("p", "u", p.url.replace(/^https?:\/\//, "")));
      grid.appendChild(a); probe(p.url, dot);
    });
    wrap.appendChild(grid); dash.appendChild(wrap); dash.hidden = false;
  }

  // Reachability only: no-cors can't read status codes, so a proxy 502 still reads as "up".
  function probe(url, dot) {
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, 8000);
    fetch(url, { mode: "no-cors", cache: "no-store", signal: c.signal })
      .then(function () { dot.className = "dot up"; dot.title = "Reachable"; })
      .catch(function () { dot.className = "dot down"; dot.title = "Unreachable"; })
      .finally(function () { clearTimeout(t); });
  }
})();
