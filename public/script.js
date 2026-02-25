let currentUser = null;


// ===== USER LADEN =====
async function loadUser() {
    try {
        const res = await fetch("/api/user");
        const data = await res.json();

        if (data.user) {
            currentUser = data.user.toLowerCase();

            const greeting = document.getElementById("greeting");
            const hour = new Date().getHours();

            let text = "Guten Tag";
            if (hour < 12) text = "Guten Morgen";
            else if (hour >= 18) text = "Guten Abend";

            greeting.innerText = `${text}, ${data.user}`;
        }
    } catch (error) {
        console.error("Fehler beim Laden des Users:", error);
    }
}

// ===== UHR ======
function updateClock() {
    const now = new Date();

    const date = now.toLocaleDateString("de-DE");
    const time = now.toLocaleTimeString("de-DE");

    document.getElementById("date").innerText = "Datum: " + date;
    document.getElementById("clock").innerText = time;
}

  

 

// ===== AUFGABEN =====

 

async function addTask() {

    const input = document.getElementById("newTask");
    const text = input.value.trim();
    if (text === "") return;

    await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text: text,
            completed: false,
            author: currentUser
        })
    });

    input.value = "";
    loadTasks();
}

 

function createTask(text, completed = false, author = "") {

    const li = document.createElement("li");

    const leftDiv = document.createElement("div");
    leftDiv.classList.add("task-left");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;

    const span = document.createElement("span");
    span.textContent = text;

    const authorSpan = document.createElement("small");
    authorSpan.textContent = " (" + author + ")";
    authorSpan.style.color = "#666";

    if (completed) {
        li.classList.add("completed");
    }

    checkbox.addEventListener("change", async () => {
        await updateTaskStatus(text, checkbox.checked);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.onclick = async () => {
        await deleteTask(text);
    };

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);
    leftDiv.appendChild(authorSpan);

    li.appendChild(leftDiv);
    li.appendChild(deleteBtn);

    document.getElementById("taskList").appendChild(li);
}



async function loadTasks() {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();

    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach(task => {
        createTask(task.text, task.completed, task.author);
    });
}
 

async function updateTaskStatus(text, completed) {

    const res = await fetch("/api/tasks");
    const tasks = await res.json();

    const updated = tasks.map(task => {
        if (task.text === text) {
            task.completed = completed;
        }
        return task;
    });

    await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });

    loadTasks();
}

async function deleteTask(text) {

    const res = await fetch("/api/tasks");
    const tasks = await res.json();

    const filtered = tasks.filter(task => task.text !== text);

    await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtered)
    });

    loadTasks();
}

    // == Ping alle 5 Minuten == //
    setInterval(() => {
    fetch("/api/tasks");
}, 5 * 60 * 1000);

const colleagues = ["Can", "Brahim", "Ramazan", "Philip", "Jonas"];

async function loadMoods() {
    const res = await fetch("/api/moods");
    const moods = await res.json();

    const container = document.getElementById("moodContainer");
    container.innerHTML = "";

    colleagues.forEach(name => {
        const div = document.createElement("div");
        div.classList.add("mood-user");

        const nameSpan = document.createElement("span");
        nameSpan.textContent = name.charAt(0).toUpperCase() + name.slice(1);

        const moodDisplay = document.createElement("span");
        moodDisplay.classList.add("mood-display");

        const mood = moods[name];
        if (mood === "good") moodDisplay.textContent = "🟢";
        else if (mood === "normal") moodDisplay.textContent = "🟡";
        else if (mood === "bad") moodDisplay.textContent = "🔴";
        else moodDisplay.textContent = "⚪";

        const buttons = document.createElement("div");
        buttons.classList.add("mood-buttons");

        if (name === currentUser) {
            ["good", "normal", "bad"].forEach(state => {
                const btn = document.createElement("button");
                btn.textContent =
                    state === "good" ? "🟢" :
                    state === "normal" ? "🟡" : "🔴";

                btn.onclick = async () => {
                    await fetch("/api/moods", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ mood: state })
                    });
                    loadMoods();
                };

                buttons.appendChild(btn);
            });
        }

        div.appendChild(nameSpan);
        div.appendChild(moodDisplay);
        div.appendChild(buttons);

        container.appendChild(div);
    });
}

let currentMoodState = null;

async function loadCurrentMood() {
    const res = await fetch("/api/moods");
    const moods = await res.json();

    const resUser = await fetch("/api/user");
    const userData = await resUser.json();

    const mood = moods[userData.user];
    currentMoodState = mood;

    const moodElement = document.getElementById("currentMood");

    if (mood === "good") moodElement.textContent = "😊";
    else if (mood === "normal") moodElement.textContent = "😐";
    else if (mood === "bad") moodElement.textContent = "😞";
}

function changeMood(state) {
    fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: state })
    }).then(() => {
        loadCurrentMood();
        document.getElementById("moodDropdown").classList.add("hidden");
    });
}



document.addEventListener("DOMContentLoaded", async () => {

    await loadUser();
    loadTasks();
    loadMoods();
    loadCurrentMood();

    updateClock();
    setInterval(updateClock, 1000);

    // 🔁 Auto-Update alle 3 Sekunden
    setInterval(() => {
        loadMoods();
        loadCurrentMood();
    }, 3000);

    // Enter für neue Aufgabe
    const input = document.getElementById("newTask");
    if (input) {
        input.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                addTask();
            }
        });
    }

    // Klick auf eigene Stimmung
    const moodBtn = document.getElementById("currentMood");
    if (moodBtn) {
        moodBtn.addEventListener("click", () => {
            document.getElementById("moodDropdown").classList.toggle("hidden");
        });
    }

    // Aufgaben 
    setInterval(loadTasks, 3000);

});
