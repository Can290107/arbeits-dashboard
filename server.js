const express = require("express");
const fs = require("fs");
const session = require("express-session");
const path = require("path");

const DATA_FILE = "tasks.json";
const MOOD_FILE = "moods.json";
const EVENTS_FILE = "events.json";
// Datei automatisch erstellen, falls sie fehlt
if (!fs.existsSync(MOOD_FILE)) {
    fs.writeFileSync(MOOD_FILE, "{}");
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
}

if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, "[]");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "azubi-dashboard-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 30 * 60 * 1000,
        expires: false   // Session-Cookie
    }
}));

// Benutzer (später kann das in DB)
const users = [
    { username: "Jonas", password: "28.02" },
    { username: "Can", password: "12345" },
    { username: "Brahim", password: "Yarrak20"},
    { username: "Philip", password: "Schnarchnase"},
    { username: "Ramazan", password: "1234"}
];

// Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = user.username;
        res.redirect("/mood.html");
    } else {
        res.send("Login fehlgeschlagen");
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login.html");
});


// Statische Dateien IMMER frei zugänglich (CSS, JS, Bilder)
app.use(express.static("public", { index: false }));

// Middleware Schutz
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }
    next();
}

// Startseite schützen
app.get("/", requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// User Info API
app.get("/api/user", (req, res) => {
    if (!req.session.user) return res.json({ user: null });
    res.json({ user: req.session.user });
});



// Stimmungen abrufen
app.get("/api/moods", requireLogin, (req, res) => {
    const data = fs.readFileSync(MOOD_FILE);
    res.json(JSON.parse(data));
});

// Stimmung setzen
app.post("/api/moods", requireLogin, (req, res) => {
    const moods = JSON.parse(fs.readFileSync(MOOD_FILE));
    moods[req.session.user] = req.body.mood;
    fs.writeFileSync(MOOD_FILE, JSON.stringify(moods, null, 2));
    res.json({ status: "ok" });
});

app.get("/api/tasks", requireLogin, (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
});

app.post("/api/tasks", requireLogin, (req, res) => {
    const tasks = JSON.parse(fs.readFileSync(DATA_FILE));
    tasks.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    res.json({ status: "ok" });
});

app.put("/api/tasks", requireLogin, (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ status: "updated" });
});


// ===== EVENTS API =====

// Alle Events abrufen
app.get("/api/events", requireLogin, (req, res) => {
    const data = fs.readFileSync(EVENTS_FILE);
    res.json(JSON.parse(data));
});

// Neues Event speichern
app.post("/api/events", requireLogin, (req, res) => {
    const events = JSON.parse(fs.readFileSync(EVENTS_FILE));
    events.push(req.body);
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
    res.json({ status: "ok" });
});

// Event löschen
app.delete("/api/events/:id", requireLogin, (req, res) => {
    const events = JSON.parse(fs.readFileSync(EVENTS_FILE));
    const filtered = events.filter(event => event.id !== req.params.id);
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(filtered, null, 2));
    res.json({ status: "deleted" });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});