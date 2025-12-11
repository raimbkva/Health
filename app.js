const API_URL = 'http://localhost:3000';

// ===== Регистрация =====
async function register() {
    let name = document.getElementById("regName").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("Заполните все поля!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: email, 
                password: password,
                name: name 
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка регистрации');
        }

        alert("Регистрация успешна!");
        window.location.href = "login.html";
    } catch (error) {
        alert(error.message);
    }
}

// ===== Вход =====
async function login() {
    let email = document.getElementById("logEmail").value;
    let password = document.getElementById("logPassword").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: email, 
                password: password 
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка входа');
        }

        // Сохраняем токен вместо пароля
        localStorage.setItem('token', data.token);
        localStorage.setItem('loggedIn', 'true');
        
        window.location.href = "index.html";
    } catch (error) {
        alert(error.message);
    }
}

// ===== Загрузка данных пользователя =====
async function loadUser() {
    const token = localStorage.getItem('token');
    const logged = localStorage.getItem('loggedIn');

    if (!token || logged !== 'true') {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Токен недействителен
                logout();
                return;
            }
            throw new Error('Ошибка загрузки данных пользователя');
        }

        const user = await response.json();
        document.getElementById("userEmail").innerText = "Вы вошли как: " + user.username;
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные пользователя');
    }
}

// ===== Загрузка дашборда =====
async function loadDashboard() {
    const token = localStorage.getItem('token');
    const logged = localStorage.getItem('loggedIn');

    if (!token || logged !== 'true') {
        window.location.href = "login.html";
        return;
    }

    try {
        // Загружаем данные пользователя
        const userResponse = await fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userResponse.ok) {
            logout();
            return;
        }

        const user = await userResponse.json();
        document.getElementById("userEmail").innerText = user.username;

        // Загружаем данные трекеров
        await loadTrackers();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

// ===== Загрузка трекеров =====
async function loadTrackers() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/tracker`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки трекеров');
        }

        const trackerData = await response.json();
        
        // Обновляем UI с данными из БД
        document.getElementById("waterValue").innerText = trackerData.water || 0;
        document.getElementById("stepsValue").innerText = trackerData.steps || 0;
        document.getElementById("sleepValue").innerText = trackerData.sleep || 0;
        document.getElementById("foodValue").innerText = trackerData.food || 0;
        document.getElementById("workoutValue").innerText = trackerData.workout || 0;
    } catch (error) {
        console.error('Ошибка загрузки трекеров:', error);
    }
}

// ===== Изменение значения трекера =====
async function changeValue(name, amount) {
    const token = localStorage.getItem('token');
    
    try {
        // Сначала получаем текущие данные
        const currentResponse = await fetch(`${API_URL}/tracker`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!currentResponse.ok) {
            throw new Error('Ошибка получения данных');
        }

        const currentData = await currentResponse.json();
        
        // Вычисляем новое значение
        let current = currentData[name] || 0;
        let updated = parseInt(current) + amount;
        
        if (updated < 0) updated = 0;

        // Обновляем только изменяемое поле
        const updateData = { ...currentData };
        updateData[name] = updated;

        // Отправляем обновленные данные на сервер
        const updateResponse = await fetch(`${API_URL}/tracker`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            throw new Error('Ошибка обновления данных');
        }

        // Обновляем UI
        document.getElementById(name + "Value").innerText = updated;
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось обновить данные');
    }
}

// ===== Кнопки в header =====
function openProfile() {
    alert("Раздел личного кабинета будет позже 💙");
}

function openSettings() {
    alert("Раздел настроек будет позже ⚙️");
}

// ===== Выход =====
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedIn');
    window.location.href = "login.html";
}