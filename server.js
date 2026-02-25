const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "tasks.json";

app.get("/api/tasks", (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
});

app.post("/api/tasks", (req, res) => {
    const tasks = JSON.parse(fs.readFileSync(DATA_FILE));
    tasks.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    res.json({ status: "ok" });
});

app.put("/api/tasks", (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ status: "updated" });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});