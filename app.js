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
// Обновление UI трекера
function updateUI(name) {
    let value = localStorage.getItem(name) || 0;
    document.getElementById(name + "Value").innerText = value;
}

// Изменение значения трекера
function changeValue(name, amount) {
    let current = parseInt(localStorage.getItem(name)) || 0;
    let updated = current + amount;
    
    // Проверка, чтобы не уходить в минус
    if (updated < 0) updated = 0; 

    localStorage.setItem(name, updated);
    updateUI(name);

    // Добавляем автоматический анализ при изменении данных
    analyzeData(); 
}

// ================= НОВЫЕ AI ФУНКЦИИ =================

/**
 * AI-функция: Анализ данных и Рекомендации
 */
function analyzeData() {
    const water = parseInt(localStorage.getItem("water")) || 0;
    const steps = parseInt(localStorage.getItem("steps")) || 0;
    const sleep = parseInt(localStorage.getItem("sleep")) || 0;
    const food = parseInt(localStorage.getItem("food")) || 0;
    const workout = parseInt(localStorage.getItem("workout")) || 0;

    let recommendations = "Отлично! Ваши показатели в норме. Продолжайте в том же духе. 💪";

    // Имитация анализа и рекомендаций
    if (water < 4) {
        recommendations = "💧 Вы пьете недостаточно воды. Постарайтесь увеличить потребление до 8 стаканов.";
    } 
    if (steps < 5000) {
        recommendations = "👣 Ваши шаги ниже рекомендуемого минимума. Совершайте ежедневные 30-минутные прогулки.";
    }
    if (sleep < 7) {
        recommendations = "😴 Мало спите. Недосыпание снижает иммунитет. Попробуйте ложиться раньше.";
    }
    if (food > 2500) {
        recommendations = "🍎 Ваш калораж слишком высок. Пересмотрите свой рацион и уменьшите порции.";
    }
    if (workout < 30) {
        recommendations = "🏋️‍♀️ Ваши тренировки слишком короткие. Увеличьте активность до 40-60 минут.";
    }
    if (water < 4 && sleep < 7) {
        recommendations = "❗️ **Критический анализ:** Вам нужно срочно наладить режим сна и пить больше воды! Ваше тело нуждается в восстановлении.";
    }


    document.getElementById("aiRecommendations").innerHTML = recommendations;
}

/**
 * AI-функция: Чат-Ассистент
 */
function sendMessage() {
    const chatInput = document.getElementById("chatInput");
    const chatWindow = document.getElementById("chatWindow");
    const userMessage = chatInput.value.trim();

    if (userMessage === "") return;

    // Добавляем сообщение пользователя
    appendMessage(userMessage, 'user');
    chatInput.value = ""; // Очищаем поле ввода

    // Имитация ответа AI-ассистента
    setTimeout(() => {
        const aiResponse = generateAiResponse(userMessage);
        appendMessage(aiResponse, 'ai');
    }, 500);
}

function appendMessage(text, sender) {
    const chatWindow = document.getElementById("chatWindow");
    const messageElement = document.createElement('p');
    messageElement.classList.add('chat-message', sender);
    messageElement.innerText = text;
    chatWindow.appendChild(messageElement);

    // Прокрутка вниз для отображения последнего сообщения
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function generateAiResponse(message) {
    message = message.toLowerCase();

    if (message.includes("вода")) {
        return "Рекомендуется выпивать около 8 стаканов (примерно 2 литра) воды в день. Вода важна для метаболизма и энергии!";
    } else if (message.includes("шаги")) {
        return "Цель в 10,000 шагов хороша, но даже 7,000 шагов в день уже значительно улучшат ваше кардио-здоровье.";
    } else if (message.includes("сон")) {
        return "Взрослым обычно требуется 7-9 часов сна. Помните, что качество сна важнее его количества.";
    } else if (message.includes("калории") || message.includes("питание")) {
        return "Средняя норма калорий для взрослого варьируется от 1800 до 2500 ккал в зависимости от пола и активности. Для точного расчета нужны ваши параметры.";
    } else if (message.includes("тренировки")) {
        return "Старайтесь уделять умеренным аэробным нагрузкам не менее 150 минут в неделю. Не забывайте про силовые упражнения!";
    } else if (message.includes("привет") || message.includes("здравствуй")) {
        return "Привет! Я готов помочь вам проанализировать ваши показатели здоровья.";
    } else {
        return "Я могу ответить на вопросы о воде, сне, шагах, питании и тренировках. Спросите что-нибудь конкретное!";
    }
}
// ===== Кнопки в header =====
function openProfile() {
   window.location.href = "profile.html";
}

function openSettings() {
    window.location.href = "settings.html";
}

// ===== Выход =====
function logout() {
    localStorage.setItem("loggedIn", "false");
    window.location.href = "login.html";
}

