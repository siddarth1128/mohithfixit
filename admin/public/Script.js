// Toast notification system
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  // Trigger show animation
  setTimeout(() => toast.classList.add("show"), 50);

  // Auto remove after 4s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Dark mode toggle
const modeToggle = document.getElementById("modeToggle");
modeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  modeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

/* LOGIN */
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) return showToast('Please enter email and password.', 'error');

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return showToast(data.message || 'Login failed.', 'error');
    }

    // success
    showToast(data.message || 'Login successful.', 'success');
    setTimeout(() => window.location.href = '/admin/dashboard', 1500);
  } catch (err) {
    console.error(err);
    showToast('Network error.', 'error');
  }
});

/* REGISTER (admin) */
document.getElementById('registerBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  const adminSecret = document.getElementById('adminSecret')?.value.trim();

  if (!name || !email || !password || !adminSecret) 
    return showToast('Please fill all fields.', 'error');
  if (password.length < 6) return showToast('Password must be at least 6 characters.', 'error');

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password, adminSecret })
    });
    const data = await res.json();
    if (!res.ok) return showToast(data.message || 'Registration failed.', 'error');
    
    showToast(data.message || 'Registered successfully. Please sign in.', 'success');
    setTimeout(() => window.location.href = '/index.html', 1500);
  } catch (err) {
    console.error(err);
    showToast('Network error.', 'error');
  }
});