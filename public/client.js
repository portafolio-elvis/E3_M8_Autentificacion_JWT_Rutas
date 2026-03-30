// Manejar envío del formulario de registro
async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Enviar datos al servidor
  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok) {
    document.getElementById('message').textContent = data.mensaje;
    window.location.href = 'login.html';
  } else {
    document.getElementById('message').textContent = data.error;
  }
}

// Manejar envío del formulario de login
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Enviar credenciales al servidor
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok) {
    // Guardar token en localStorage para futuros requests
    localStorage.setItem('token', data.token);
    document.getElementById('message').textContent = 'Login exitoso';
  } else {
    document.getElementById('message').textContent = data.error;
  }
}

// Asignar manejadores a los formularios cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});
