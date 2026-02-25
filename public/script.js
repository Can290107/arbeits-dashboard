let currentUser = null;


// ===== USER LADEN =====
async function loadUser() {
  
    if (data.user) {
        currentUser = data.user.toLowerCase();
        const greeting = document.getElementById("greeting");
        const hour = new Date().getHours();

        let text = "Guten Tag";
        if (hour < 12) text = "Guten Morgen";
        else if (hour >= 18) text = "Guten Abend";

        greeting.innerText = `${text}, ${data.user}`;
    }
}

// ===== UHR ======
async function updateClock() {
    const now = new Date();

    const date = now.toLocaleDateString("de-DE");
    const time = now.toLocaleTimeString("de-DE");

    document.getElementById("date").innerText = "Datum: " + date;
    document.getElementById("clock").innerText = time;

    const res = await fetch("/api/user");
    const data = await res.json();

    let greetingText = "Guten Tag";
    const hour = now.getHours();

    if (hour < 12) greetingText = "Guten Morgen";
    else if (hour >= 18) greetingText = "Guten Abend";

    if (data.user) {
        greetingText += ", " + data.user;
    }

    document.getElementById("greeting").innerText = greetingText;
}



 

// ===== AUFGABEN =====

 

function addTask() {

    const input = document.getElementById("newTask");

    const text = input.value.trim();

 

    if (text === "") return;

 

    createTask(text);

    saveTasks();

 

    input.value = "";

}

 

function createTask(text, completed = false) {

    const li = document.createElement("li");

 

    const leftDiv = document.createElement("div");

    leftDiv.classList.add("task-left");

 

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = completed;

 

    const span = document.createElement("span");

    span.textContent = text;

 

    if (completed) {

        li.classList.add("completed");

    }

 

    checkbox.addEventListener("change", () => {

        li.classList.toggle("completed");

        saveTasks();

    });

 

    leftDiv.appendChild(checkbox);

    leftDiv.appendChild(span);

 

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "X";

    deleteBtn.classList.add("delete-btn");

 

    deleteBtn.onclick = () => {

        li.remove();

        saveTasks();

    };

 

    li.appendChild(leftDiv);

    li.appendChild(deleteBtn);

 

    document.getElementById("taskList").appendChild(li);

}

 

// ENTER Taste zum Hinzufügen

document.getElementById("newTask").addEventListener("keypress", function(e) {

    if (e.key === "Enter") {

        addTask();

    }

});

 

// ===== LocalStorage =====

 

function saveTasks() {

    const tasks = [];

 

    document.querySelectorAll("#taskList li").forEach(li => {

        const text = li.querySelector("span").textContent;

        const completed = li.classList.contains("completed");

 

        tasks.push({ text, completed });

    });

 

    localStorage.setItem("tasks", JSON.stringify(tasks));

}

 

function loadTasks() {

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

 

    tasks.forEach(task => {

        createTask(task.text, task.completed);

    });
}

    // == Ping alle 5 Minuten ==
    setInterval(() => {
    fetch("/api/tasks");
}, 5 * 60 * 1000);

document.addEventListener("DOMContentLoaded", async () => {
    await loadUser();   // Warten bis User gesetzt ist
    loadTasks();
    loadMoods();        // Danach Stimmungen laden

    updateClock();
    setInterval(updateClock, 1000);
});

const colleagues = ["can", "brahim", "ramazan", "philip", "jonas"];

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