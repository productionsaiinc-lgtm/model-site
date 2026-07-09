const AUTH_API = "https://model-site-alpha.vercel.app/api/auth";
async function signup(email, password) {
  return fetch(`${AUTH_API}/signup`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  }).then(r => r.json());
}

async function login(email, password) {
  return fetch(`${AUTH_API}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  }).then(r => r.json());
}

window.NovaAuth = { signup, login };
