// Регистрация
function register() {
    let name = document.getElementById("regName").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("Заполните все поля!");
        return;
    }

    let user = { name, email, password };
    localStorage.setItem("user", JSON.stringify(user));

    alert("Регистрация успешна!");
    window.location.href = "login.html";
}

// Вход
function login() {
    let email = document.getElementById("logEmail").value;
    let password = document.getElementById("logPassword").value;

    let user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Пользователь не найден!");
        return;
    }

    if (email === user.email && password === user.password) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
    } else {
        alert("Неверный логин или пароль!");
    }
}

// Главная — загрузка пользователя
function loadUser() {
    let logged = localStorage.getItem("loggedIn");

    if (logged !== "true") {
        window.location.href = "login.html";
        return;
    }

    let user = JSON.parse(localStorage.getItem("user"));
    document.getElementById("userEmail").innerText = "Вы вошли как: " + user.email;
}
// Загружаем данные пользователя и трекеров
function loadDashboard() {
    let logged = localStorage.getItem("loggedIn");
    if (logged !== "true") {
        window.location.href = "login.html";
        return;
    }

    let user = JSON.parse(localStorage.getItem("user"));
    document.getElementById("userEmail").innerText = user.email;

    // Загружаем трекеры
    updateUI("water");
    updateUI("steps");
    updateUI("sleep");
    updateUI("food");
    updateUI("workout");
}

// Обновление UI трекера
function updateUI(name) {
    let value = localStorage.getItem(name) || 0;
    document.getElementById(name + "Value").innerText = value;
}

// Изменение значения трекера
function changeValue(name, amount) {
    let current = parseInt(localStorage.getItem(name)) || 0;
    let updated = current + amount;

    if (updated < 0) updated = 0;

    localStorage.setItem(name, updated);
    updateUI(name);
}

// Загружаем email и трекеры
function loadDashboard() {
    let logged = localStorage.getItem("loggedIn");

    if (logged !== "true") {
        window.location.href = "login.html";
        return;
    }

    let user = JSON.parse(localStorage.getItem("user"));
    document.getElementById("userEmail").innerText = user.email;

    updateUI("water");
    updateUI("steps");
    updateUI("sleep");
    updateUI("food");
    updateUI("workout");
}

function updateUI(name) {
    let value = localStorage.getItem(name) || 0;
    document.getElementById(name + "Value").innerText = value;
}

function changeValue(name, amount) {
    let current = parseInt(localStorage.getItem(name)) || 0;
    let updated = current + amount;
    if (updated < 0) updated = 0;

    localStorage.setItem(name, updated);
    updateUI(name);
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
    localStorage.setItem("loggedIn", "false");
    window.location.href = "login.html";
}

