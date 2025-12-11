const express = require("express");
const pg = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "your_jwt_secret_key"; // В продакшене используйте переменные окружения

const db = new pg.Pool({
  user: "postgres",
  password: "your_password",
  host: "localhost",
  port: 5432,
  database: "healthapp"
});

// Middleware для проверки токена
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Токен отсутствует" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Недействительный токен" });
  }
};

// Расширенная регистрация с именем
app.post("/register", async (req, res) => {
  const { username, password, name } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Заполните все обязательные поля" });
  }

  try {
    // Проверяем, существует ли пользователь
    const existingUser = await db.query(
      "SELECT id FROM users WHERE username = $1", 
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Пользователь с таким email уже существует" });
    }

    const hash = await bcrypt.hash(password, 10);
    
    const newUser = await db.query(
      "INSERT INTO users (username, password, name) VALUES ($1, $2, $3) RETURNING id, username, name",
      [username, hash, name || null]
    );

    // Создаем пустой трекер для пользователя
    await db.query(
      "INSERT INTO tracker (user_id, sleep, steps, water, food, workout) VALUES ($1, 0, 0, 0, 0, 0)",
      [newUser.rows[0].id]
    );

    res.status(201).json({ 
      message: "Регистрация успешна", 
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        name: newUser.rows[0].name
      }
    });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Вход
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Заполните все поля" });
  }

  try {
    const user = await db.query(
      "SELECT * FROM users WHERE username = $1", 
      [username]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const valid = await bcrypt.compare(password, user.rows[0].password);
    
    if (!valid) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username }, 
      SECRET, 
      { expiresIn: "7d" }
    );

    res.json({ 
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        name: user.rows[0].name
      }
    });
  } catch (err) {
    console.error("Ошибка входа:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Получение данных текущего пользователя
app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await db.query(
      "SELECT id, username, name FROM users WHERE id = $1", 
      [req.userId]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error("Ошибка получения данных пользователя:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Получение данных трекера
app.get("/tracker", verifyToken, async (req, res) => {
  try {
    const tracker = await db.query(
      "SELECT * FROM tracker WHERE user_id = $1", 
      [req.userId]
    );
    
    if (tracker.rows.length === 0) {
      // Создаем трекер, если не существует
      const newTracker = await db.query(
        "INSERT INTO tracker (user_id, sleep, steps, water, food, workout) VALUES ($1, 0, 0, 0, 0, 0) RETURNING *",
        [req.userId]
      );
      return res.json(newTracker.rows[0]);
    }

    res.json(tracker.rows[0]);
  } catch (err) {
    console.error("Ошибка получения трекера:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Обновление данных трекера
app.post("/tracker", verifyToken, async (req, res) => {
  const { sleep = 0, steps = 0, water = 0, food = 0, workout = 0 } = req.body;

  try {
    // Проверяем существование трекера
    const existingTracker = await db.query(
      "SELECT id FROM tracker WHERE user_id = $1", 
      [req.userId]
    );

    let result;
    
    if (existingTracker.rows.length === 0) {
      // Создаем новый трекер
      result = await db.query(
        `INSERT INTO tracker (user_id, sleep, steps, water, food, workout) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [req.userId, sleep, steps, water, food, workout]
      );
    } else {
      // Обновляем существующий трекер
      result = await db.query(
        `UPDATE tracker 
         SET sleep = $1, steps = $2, water = $3, food = $4, workout = $5 
         WHERE user_id = $6 
         RETURNING *`,
        [sleep, steps, water, food, workout, req.userId]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка обновления трекера:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Получение всех данных пользователя (профиль)
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await db.query(
      "SELECT id, username, name, created_at FROM users WHERE id = $1", 
      [req.userId]
    );
    
    const tracker = await db.query(
      "SELECT * FROM tracker WHERE user_id = $1", 
      [req.userId]
    );

    res.json({
      user: user.rows[0],
      tracker: tracker.rows[0] || {}
    });
  } catch (err) {
    console.error("Ошибка получения профиля:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));