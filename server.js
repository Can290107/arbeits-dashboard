const express = require("express");
const fs = require("fs");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "azubi-dashboard-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: null // Session endet beim Schließen des Browsers
    }
}));

// Benutzer (später kann das in DB)
const users = [
    { username: "Jonas", password: "28.02" },
    { username: "Can", password: "1234" },
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
        res.redirect("/");
    } else {
        res.send("Login fehlgeschlagen");
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login.html");
});


// Login-Seite öffentlich zugänglich
app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Middleware Schutz
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }
    next();
}

// Alles andere im public-Ordner schützen
app.use(requireLogin, express.static("public"));

// User Info API
app.get("/api/user", (req, res) => {
    if (!req.session.user) return res.json({ user: null });
    res.json({ user: req.session.user });
});

const DATA_FILE = "tasks.json";

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

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});