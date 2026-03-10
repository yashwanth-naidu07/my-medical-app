// Function to switch between Login, Register, and Forgot Password views
function toggleForm(view) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('forgot-section').style.display = 'none';

    if (view === 'login') document.getElementById('login-section').style.display = 'block';
    if (view === 'register') document.getElementById('register-section').style.display = 'block';
    if (view === 'forgot') document.getElementById('forgot-section').style.display = 'block';
}

// 1. REGISTER: Send data to MongoDB via Backend
document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const registerData = {
        fullName: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        password: form.querySelector('input[type="password"]').value,
        role: form.querySelector('select').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        const result = await response.json();
        
        if (response.ok) {
            alert("Success: " + result.message);
            toggleForm('login');
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Cannot connect to server. Is server.js running?");
    }
};

// 2. LOGIN: Verify credentials from MongoDB
document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const loginData = {
        email: document.getElementById('loginEmail').value,
        pass: document.getElementById('loginPass').value,
        role: document.getElementById('role').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('userRole', result.role);
            window.location.href = 'dashboard.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Login failed. Check if backend is active.");
    }
};