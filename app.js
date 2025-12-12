/*****************************
 *      РЕГИСТРАЦИЯ
 *****************************/
function register() {
    let name = document.getElementById("regName").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("Заполните все поля!");
        return;
    }

    let user = { name, email, password };
    localStorage.setItem(`user_${email}`, JSON.stringify(user));

    alert("Регистрация успешна!");
    window.location.href = "login.html";
}

/*****************************
 *      ВХОД
 *****************************/
function login() {
    let email = document.getElementById("logEmail").value;
    let password = document.getElementById("logPassword").value;

    let user = JSON.parse(localStorage.getItem(`user_${email}`));

    if (!user) {
        alert("Пользователь не найден!");
        return;
    }

    if (password !== user.password) {
        alert("Неверный пароль!");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("loggedIn", "true");

    window.location.href = "index.html";
}

/*****************************
 *    ЗАГРУЗКА ГЛАВНОЙ
 *****************************/
function loadDashboard() {
    if (localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    let user = JSON.parse(localStorage.getItem("currentUser"));
    document.getElementById("userEmail").innerText = user.email;

    updateUI("water");
    updateUI("steps");
    updateUI("sleep");
    updateUI("food");
    updateUI("workout");

    renderCalendar();
}

/*****************************
 *        ТРЕКЕРЫ
 *****************************/
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
    analyzeData();
}

/*****************************
 *      КАЛЕНДАРЬ
 *****************************/
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    document.getElementById("monthLabel").innerText =
        `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Пустые ячейки перед первым днем
    for (let i = 1; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-cell", "empty");
        calendar.appendChild(emptyCell);
    }

    // Заполнение дней месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const tasks = JSON.parse(localStorage.getItem("tasks_" + dateStr)) || [];

        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");

        // подсветка сегодняшнего дня
        const today = new Date();
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            cell.style.backgroundColor = "#e0f7fa";
        }

        // дата
        const dateNumber = document.createElement("div");
        dateNumber.className = "date-number";
        dateNumber.innerText = day;
        cell.appendChild(dateNumber);

        // задачи
        const taskList = document.createElement("div");
        taskList.className = "task-list";

        tasks.forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.className = "task-item";
            taskItem.innerHTML = `<span style="${task.done ? 'text-decoration: line-through' : ''}" onclick="toggleDone('${dateStr}', ${index})">${task.text}</span>
                                  <button onclick="editTask('${dateStr}', ${index})">✏️</button>
                                  <button onclick="deleteTask('${dateStr}', ${index})">🗑️</button>`;
            taskList.appendChild(taskItem);
        });

        cell.appendChild(taskList);

        // добавление новой задачи
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Новая задача...";
        input.id = "input-" + dateStr;
        input.className = "task-input";

        const addBtn = document.createElement("button");
        addBtn.innerText = "+";
        addBtn.onclick = () => addTask(dateStr);

        cell.appendChild(input);
        cell.appendChild(addBtn);

        calendar.appendChild(cell);
    }
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

/*****************************
 *        ЗАДАЧИ
 *****************************/
function addTask(dateStr) {
    const input = document.getElementById("input-" + dateStr);
    const text = input.value.trim();
    if (!text) return;

    let tasks = JSON.parse(localStorage.getItem("tasks_" + dateStr)) || [];
    tasks.push({ text, done: false });
    localStorage.setItem("tasks_" + dateStr, JSON.stringify(tasks));

    input.value = "";
    renderCalendar();
}

function toggleDone(dateStr, index) {
    let tasks = JSON.parse(localStorage.getItem("tasks_" + dateStr)) || [];
    tasks[index].done = !tasks[index].done;
    localStorage.setItem("tasks_" + dateStr, JSON.stringify(tasks));
    renderCalendar();
}

function editTask(dateStr, index) {
    let tasks = JSON.parse(localStorage.getItem("tasks_" + dateStr)) || [];
    const newText = prompt("Редактировать задачу", tasks[index].text);
    if (newText !== null) {
        tasks[index].text = newText;
        localStorage.setItem("tasks_" + dateStr, JSON.stringify(tasks));
        renderCalendar();
    }
}

function deleteTask(dateStr, index) {
    let tasks = JSON.parse(localStorage.getItem("tasks_" + dateStr)) || [];
    tasks.splice(index, 1);
    localStorage.setItem("tasks_" + dateStr, JSON.stringify(tasks));
    renderCalendar();
}

/*****************************
 * AI-функция: Анализ данных и Рекомендации
 *****************************/
function analyzeData() {
    const data = {
        water: parseInt(localStorage.getItem("water")) || 0,
        steps: parseInt(localStorage.getItem("steps")) || 0,
        sleep: parseInt(localStorage.getItem("sleep")) || 0,
        food: parseInt(localStorage.getItem("food")) || 0,
        workout: parseInt(localStorage.getItem("workout")) || 0,
    };

    let recommendationsList = [];
    let criticalIssues = false;
    let seriousWarning = false;

    // Сон
    if (data.sleep < 6) {
        recommendationsList.push(`😴 *Дефицит сна (менее 6 часов):* Вам критически не хватает сна.`);
        criticalIssues = true;
    } else if (data.sleep < 7) {
        recommendationsList.push(`💤 *Мало спите (7-8 часов - ваша цель):* Попробуйте ложиться раньше.`);
    } else if (data.sleep > 10) {
        recommendationsList.push(`🛌 *Избыток сна (более 10 часов):* Чрезмерный сон может быть признаком усталости.`);
    }

    // Вода
    if (data.water < 4) {
        recommendationsList.push(`💧 *Обезвоживание (менее 4 стаканов):* Пейте больше воды.`);
        seriousWarning = true;
    }

    // Питание
    if (data.food < 1500 && data.food !== 0) {
        recommendationsList.push(`📉 *Недостаток калорий:* Ваш рацион слишком скуден. Увеличьте потребление.`);
        seriousWarning = true;
    } else if (data.food > 2500) {
        recommendationsList.push(`📈 *Избыток калорий:* Ваш калораж слишком высок. Пересмотрите рацион.`);
    }

    // Шаги
    if (data.steps < 5000) {
        recommendationsList.push(`🚶‍♀ *Низкая активность:* Сделайте хотя бы 30 минут прогулки.`);
    }

    // Тренировки
    if (data.workout < 30) {
        recommendationsList.push(`🏋‍♀ *Короткие тренировки:* Увеличьте активность до 40-60 минут.`);
    }

    // Итоговое сообщение
    let finalMessage = "";
    if (recommendationsList.length === 0) {
        finalMessage = `✅ Отлично! Ваши показатели в норме. Продолжайте в том же духе. 💪`;
    } else {
        finalMessage = "<ul>" + recommendationsList.map(item => `<li>${item}</li>`).join('') + "</ul>";

        if (criticalIssues) {
            finalMessage += `<p class='warning'>🚨 *КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ:* Обратитесь к специалисту!</p>`;
        } else if (seriousWarning) {
            finalMessage += `<p class='warning'>⚠ *СЕРЬЕЗНОЕ ПРЕДУПРЕЖДЕНИЕ:* Поменяйте режим сна и питания.</p>`;
        }
    }

    document.getElementById("aiRecommendations").innerHTML = finalMessage;
}

/*****************************
 * ЧАТ ФУНКЦИИ
 *****************************/
function sendMessage() {
    const chatInput = document.getElementById("chatInput");
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, 'user');
    chatInput.value = "";

    setTimeout(() => {
        const aiResponse = generateAiResponse(userMessage);
        appendMessage(aiResponse, 'ai');
    }, 500);
}

function appendMessage(text, sender) {
    const chatWindow = document.getElementById("chatWindow");
    const p = document.createElement('p');
    p.classList.add('chat-message', sender);
    p.innerHTML = text; // innerHTML для поддержки форматирования
    chatWindow.appendChild(p);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

/*****************************
 * ЛОГИКА AI
 *****************************/
function getTrackerData() {
    return {
        water: parseInt(localStorage.getItem("water")) || 0,
        steps: parseInt(localStorage.getItem("steps")) || 0,
        sleep: parseInt(localStorage.getItem("sleep")) || 0,
        food: parseInt(localStorage.getItem("food")) || 0,
        workout: parseInt(localStorage.getItem("workout")) || 0,
    };
}

function analyzeCurrentDataForChat(data) {
    let rec = [];

    if (data.sleep < 7) rec.push(`Сон (${data.sleep} ч.): Недостаточно для восстановления.`);
    if (data.water < 8) rec.push(`Вода (${data.water} ст.): Пейте больше.`);
    if (data.steps < 7000) rec.push(`Шаги (${data.steps}): Старайтесь активнее.`);
    if (data.food > 2500) rec.push(`Питание (${data.food} ккал): Калораж слишком высок.`);
    else if (data.food < 1500 && data.food !== 0) rec.push(`Питание (${data.food} ккал): Калорий мало.`);

    if (rec.length === 0) return "✅ Отлично! Показатели сбалансированы.";
    return "🧠 Анализ трекера:\n* " + rec.join("\n* ");
}

function generateAiResponse(message) {
    const data = getTrackerData();
    message = message.toLowerCase();
    let response = "";

    if (message.includes("анализ") || message.includes("рекомендации")) {
        response = analyzeCurrentDataForChat(data);
    } else if (message.includes("похудеть")) {
        response = `🔑 Стратегия похудения: уменьшите калории (${data.food} ккал), увеличьте шаги (${data.steps}), добавьте силовые тренировки (${data.workout} мин).`;
    } else if (message.includes("набрать вес")) {
        response = `🔑 Стратегия набора массы: увеличьте калории (${data.food} ккал), тренировки (${data.workout} мин), силовые упражнения.`;
    } else if (message.includes("вода")) {
        response = `💧 Вода: вы выпили ${data.water} стаканов. Цель — 8 стаканов.`;
    } else if (message.includes("шаги")) {
        response = `👣 Шаги: ${data.steps}. Цель — 10 000 шагов.`;
    } else if (message.includes("сон")) {
        response = `😴 Сон: ${data.sleep} ч. Рекомендуется 7-9 ч.`;
    } else if (message.includes("тренировки")) {
        response = `🏋️‍♀ Тренировки: ${data.workout} мин. Цель — 30-60 мин.`;
    } else if (message.includes("привет") || message.includes("здравствуй")) {
        response = "Привет! Я твой SMART Health AI. Спросите рекомендации или анализ трекера.";
    } else {
        response = "Я могу дать рекомендации по воде, сну, шагам, питанию и тренировкам. Спросите что-то конкретное!";
    }

    return response;
}

/*****************************
 * ENTER в поле чата
 *****************************/
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

/*****************************
 *      НАВИГАЦИЯ HEADER
 *****************************/
function openProfile() {
    window.location.href = "profile.html";
}

function openSettings() {
    window.location.href = "settings.html";
}

function logout() {
    localStorage.setItem("loggedIn", "false");
    window.location.href = "login.html";
}
