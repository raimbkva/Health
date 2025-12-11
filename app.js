function register() {
    let name = document.getElementById("regName").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("Заполните все поля!");
        return;
    }

    let user = { name, email, password };
    
    // ИСПРАВЛЕНИЕ: Используем шаблонную строку (обратные кавычки `) для включения переменной ${email}
    localStorage.setItem(`user_${email}`, JSON.stringify(user)); 

    alert("Регистрация успешна!");
    window.location.href = "login.html";
}
// Вход
function login() {
    let email = document.getElementById("logEmail").value;
    let password = document.getElementById("logPassword").value;

    // 1. Поиск пользователя:
    // Мы ищем ключ вида 'user_test@example.com'
    let user = JSON.parse(localStorage.getItem(`user_${email}`)); // <--- Проблема могла быть здесь

    if (!user) {
        alert("Пользователь не найден! Проверьте Email.");
        return;
    }

    // 2. Проверка пароля:
    if (password === user.password) {
        
        // УСПЕХ: Устанавливаем текущего пользователя в 'currentUser'
        localStorage.setItem("currentUser", JSON.stringify(user)); 
        localStorage.setItem("loggedIn", "true"); 
        
        alert("Вход выполнен успешно!");
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
    
    const data = {
        water: parseInt(localStorage.getItem("water")) || 0,
        steps: parseInt(localStorage.getItem("steps")) || 0,
        sleep: parseInt(localStorage.getItem("sleep")) || 0,
        food: parseInt(localStorage.getItem("food")) || 0, // Условная цель 2000 ккал
        workout: parseInt(localStorage.getItem("workout")) || 0, // Условная цель 60 мин
    };

    let recommendationsList = []; // Массив для сбора всех проблем и рекомендаций
    let criticalIssues = false;
    let seriousWarning = false;

    // 1. Проверка СНА
    if (data.sleep < 6) {
        recommendationsList.push("😴 **Дефицит сна (менее 6 часов):** Вам критически не хватает сна. Это может негативно сказаться на когнитивных функциях и настроении.");
        criticalIssues = true;
    } else if (data.sleep < 7) {
        recommendationsList.push("💤 **Мало спите (7-8 часов - ваша цель):** Недосыпание снижает иммунитет и восстановление. Попробуйте ложиться раньше.");
    } else if (data.sleep > 10) {
        recommendationsList.push("🛌 **Избыток сна (более 10 часов):** Чрезмерный сон может быть признаком усталости или проблем со здоровьем.");
    }

    // 2. Проверка ВОДЫ
    if (data.water < 4) {
        recommendationsList.push("💧 **Обезвоживание (менее 4 стаканов):** Недостаток воды влияет на энергию и пищеварение. Поставьте цель - 8 стаканов в день.");
        seriousWarning = true;
    }

    // 3. Проверка ПИТАНИЯ (калораж)
    // Предполагаем, что 1500 ккал - это дефицит, а 2500 - избыток для среднего человека
    if (data.food < 1500 && data.food !== 0) {
        recommendationsList.push("📉 **Недостаток калорий:** Ваш рацион слишком скуден. Недостаточное питание ослабляет организм. Увеличьте количество потребляемой пищи.");
        seriousWarning = true;
    } else if (data.food > 2500) {
        recommendationsList.push("📈 **Избыток калорий:** Ваш калораж слишком высок. Пересмотрите рацион для контроля веса.");
    }
    
    // 4. Проверка ШАГОВ
    if (data.steps < 5000) {
        recommendationsList.push("🚶‍♀️ **Низкая активность:** Ваши шаги ниже рекомендуемого минимума (10 000). Совершайте ежедневные 30-минутные прогулки.");
    }
    
    // 5. Проверка ТРЕНИРОВОК
    if (data.workout < 30) {
        recommendationsList.push("🏋️‍♀️ **Короткие тренировки:** Увеличьте активность до 40-60 минут для заметного эффекта на сердечно-сосудистую систему.");
    }


    // ===================================
    // ФОРМИРОВАНИЕ ИТОГОВОГО СООБЩЕНИЯ
    // ===================================

    let finalMessage = "";

    if (recommendationsList.length === 0) {
        finalMessage = "✅ **Отлично!** Ваши показатели в норме. Продолжайте в том же духе. 💪";
    } else {
        // Выводим все обнаруженные проблемы списком
        finalMessage = "### Обнаруженные проблемы и рекомендации:\n";
        finalMessage += "<ul>" + recommendationsList.map(item => `<li>${item}</li>`).join('') + "</ul>";

        // Добавляем предупреждения, основанные на серьезности
        if (criticalIssues) {
            finalMessage += "<p class='warning'>🚨 **КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ:** У вас несколько критических нарушений режима. **Настоятельно рекомендуем обратиться к специалисту** для оценки вашего состояния.</p>";
        } else if (seriousWarning) {
            finalMessage += "<p class='warning'>⚠️ **СЕРЬЕЗНОЕ ПРЕДУПРЕЖДЕНИЕ:** Пожалуйста, немедленно позаботьтесь о себе! Изменения в режиме сна и питания необходимы для предотвращения проблем со здоровьем.</p>";
        }
    }

    // Обновление интерфейса
    document.getElementById("aiRecommendations").innerHTML = finalMessage;
}
// ===============================================
// 1. ФУНКЦИИ УПРАВЛЕНИЯ ДАННЫМИ (data loading)
// ===============================================

function getTrackerData() {
    // Получаем данные из localStorage 
    return {
        water: parseInt(localStorage.getItem("water")) || 0,
        steps: parseInt(localStorage.getItem("steps")) || 0,
        sleep: parseInt(localStorage.getItem("sleep")) || 0,
        food: parseInt(localStorage.getItem("food")) || 0,
        workout: parseInt(localStorage.getItem("workout")) || 0,
    };
}


// ===============================================
// 2. ФУНКЦИИ ЧАТА (sendMessage, appendMessage)
// ===============================================

function sendMessage() {
    const chatInput = document.getElementById("chatInput");
    const userMessage = chatInput.value.trim();

    if (userMessage === "") return;

    // 1. Добавляем сообщение пользователя
    appendMessage(userMessage, 'user');
    chatInput.value = ""; // Очищаем поле ввода

    // 2. Имитация ответа AI-ассистента
    setTimeout(() => {
        const aiResponse = generateAiResponse(userMessage);
        appendMessage(aiResponse, 'ai');
    }, 500);
}

function appendMessage(text, sender) {
    const chatWindow = document.getElementById("chatWindow");
    const messageElement = document.createElement('p');
    messageElement.classList.add('chat-message', sender);
    
    // Используем innerHTML для поддержки форматирования (например, <ul>, <b>, 🔑)
    messageElement.innerHTML = text; 
    
    chatWindow.appendChild(messageElement);

    // Прокрутка вниз для отображения последнего сообщения
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


// ===============================================
// 3. ФУНКЦИИ ЛОГИКИ AI (generateAiResponse, analyzeCurrentDataForChat)
// ===============================================

// (Вставьте сюда функции generateAiResponse и analyzeCurrentDataForChat)
function analyzeCurrentDataForChat(data) {
    let recommendationsList = [];

    if (data.sleep < 7) {
        recommendationsList.push(`Сон (${data.sleep} ч.): Похоже, вы спите меньше рекомендуемых 7-9 часов. Недосып влияет на метаболизм.`);
    }
    if (data.water < 8) {
        recommendationsList.push(`Вода (${data.water} ст.): Постарайтесь увеличить потребление. Обезвоживание может маскироваться под голод.`);
    }
    if (data.steps < 7000) {
        recommendationsList.push(`Шаги (${data.steps}): Ваша активность низкая. Включите в график 30 минут активной ходьбы.`);
    }
    if (data.food > 2500) {
        recommendationsList.push(`Питание (${data.food} ккал): Ваш калораж высок. Если цель — похудение, нужно сократить порции.`);
    } else if (data.food < 1500 && data.food !== 0) {
        recommendationsList.push(`Питание (${data.food} ккал): Ваш рацион слишком скуден. Это может замедлить метаболизм.`);
    }

    if (recommendationsList.length === 0) {
        return "✅ **Отлично!** Ваши текущие показатели сбалансированы. Продолжайте в том же духе!";
    } else {
        return "🧠 **Анализ трекера:** Я вижу несколько областей для улучшения:\n\n* " + recommendationsList.join('\n* ');
    }
}

function generateAiResponse(message) {
    message = message.toLowerCase();
    const data = getTrackerData();
    let response = "";
    // ... (весь код логики generateAiResponse) ...
    
     if (message.includes("исходя из моего трекера") || message.includes("что ты можешь порекомендовать")) {
        response = analyzeCurrentDataForChat(data);
    
    } else if (message.includes("похудеть") || message.includes("набрать вес")) {
        
        if (message.includes("похудеть")) {
            response = "🔑 **Стратегия Похудения (Дефицит):** Чтобы начать худеть, вам нужно создать дефицит калорий (тратить больше, чем потребляете).\n";
            response += `\n* **Питание:** Ваш текущий калораж ${data.food} ккал. Попробуйте уменьшить его на 200-300 ккал (до 1500-1800 для старта).\n`;
            response += `* **Активность:** Ваши текущие шаги ${data.steps}, тренировки ${data.workout} мин. Увеличьте кардио-нагрузку (шаги/бег) и добавьте силовые тренировки для сохранения мышц.`;
        } else { // Набрать вес
            response = "🔑 **Стратегия Набора Веса (Профицит):** Для набора веса (мышечной массы) нужен избыток калорий и силовые нагрузки.\n";
            response += `\n* **Питание:** Ваш текущий калораж ${data.food} ккал. Постепенно увеличьте его на 300-500 ккал, отдавая предпочтение белкам и сложным углеводам.\n`;
            response += `* **Тренировки:** Фокусируйтесь на силовых тренировках (минимум 3 раза в неделю) для стимуляции роста мышц. Ваши текущие тренировки: ${data.workout} мин.`;
        }
        
    } else if (message.includes("правильно питаться") || message.includes("сколько калорий")) {
        response = `🍎 **Общие рекомендации по питанию:** Для поддержания здоровья с вашей активностью вам, вероятно, нужно около 2000 ккал. Ваш текущий показатель: ${data.food} ккал.\n`;
        response += "* Сосредоточьтесь на цельнозерновых продуктах, белках и овощах.\n* Избегайте быстрых углеводов и избытка сахара.";
    
    } else if (message.includes("сколько стаканов воды")) {
        response = `💧 **Гидратация:** Вы выпили ${data.water} стаканов. Цель — 8 стаканов (примерно 2 литра) для нормального метаболизма. Но если вы активно тренируетесь (у вас ${data.workout} мин.), вам нужно пить ещё больше!`;
    
    // 2. БАЗОВЫЕ ЗАПРОСЫ
    
    } else if (message.includes("вода")) {
        response = `Ваш текущий показатель воды: ${data.water} стаканов. Рекомендуется 8 стаканов (около 2 литров).`;
    } else if (message.includes("шаги")) {
        response = `Ваш текущий показатель шагов: ${data.steps}. Цель в 10,000 шагов хороша, но даже 7,000 шагов в день улучшат ваше кардио-здоровье.`;
    } else if (message.includes("сон")) {
        response = `Ваш текущий сон: ${data.sleep} часов. Взрослым обычно требуется 7-9 часов. Помните, что качество сна важнее его количества.`;
    } else if (message.includes("тренировки")) {
        response = `Ваше время тренировок: ${data.workout} мин. Старайтесь уделять умеренным аэробным нагрузкам не менее 150 минут в неделю.`;
    } else if (message.includes("привет") || message.includes("здравствуй")) {
        response = "Привет! Я готов помочь вам проанализировать ваши показатели здоровья.";
    } else {
        response = "Я могу ответить на сложные вопросы (про похудение, набор веса, анализ трекера) или дать информацию о воде, сне, питании и шагах. Спросите что-нибудь конкретное!";
    }

    return response;
}


// ===============================================
// 4. ОБРАБОТЧИКИ СОБЫТИЙ (ENTER)
// ===============================================

document.addEventListener('DOMContentLoaded', (event) => {
    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            // Проверяем, была ли нажата клавиша Enter (код 13 или 'Enter')
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault(); 
                sendMessage();
            }
        });
    }
});
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

// ===============================================
// ФУНКЦИИ ПРОФИЛЯ (profile.html)
// ===============================================

function loadProfile() {
    // 1. Проверка авторизации
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Загрузка и отображение данных пользователя
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // В вашем HTML: <span id="regName"> и <span id="regEmail">
    const nameElement = document.getElementById('regName');
    const emailElement = document.getElementById('regEmail');

    if (nameElement) {
        // Предполагаем, что имя хранится как 'name'
        nameElement.textContent = currentUser.name || 'Не указано'; 
    }
    if (emailElement) {
        emailElement.textContent = currentUser.email || 'Не указано';
    }


    // 3. Загрузка и отображение статистики здоровья
    const healthData = getTrackerData(); // Используем уже существующую функцию для получения данных

    // В вашем HTML: <span id="summaryWater">, <span id="summarySteps"> и т.д.
    
    document.getElementById('summaryWater').textContent = healthData.water;
    document.getElementById('summarySteps').textContent = healthData.steps;
    document.getElementById('summarySleep').textContent = healthData.sleep;
    document.getElementById('summaryFood').textContent = healthData.food;
    document.getElementById('summaryWorkout').textContent = healthData.workout;
    
    // Обработка случая, если нет данных (т.е. нули)
    if (healthData.water === 0 && healthData.steps === 0 && healthData.sleep === 0) {
        document.querySelector('.tracker-summary p:first-child').innerHTML += 
            ' <em>(Начните отслеживать данные на главной странице)</em>';
    }
}

