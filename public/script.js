// ===== UHR ======
function updateClock() {
    const now = new Date();

    const date = now.toLocaleDateString("de-DE")
    const time = now.toLocaleTimeString("de-DE")

    document.getElementById("date").innerText = "Datum" + date;
    document.getElementById("clock").innerText = time;

    updateGreeting(now.getHours());
}
function updateGreeting(hour) {

    let greeting;

 

    if (hour < 12) greeting = "Guten Morgen ☀";

    else if (hour < 18) greeting = "Guten Tag 👋";

    else greeting = "Guten Abend 🌙";

 

    document.getElementById("greeting").innerText = greeting;

}

 

updateClock();

setInterval(updateClock, 1000);

 

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

    / *Ping alle 5 Minuten* /
    setInterval(() => {
    fetch("/api/tasks");
}, 5 * 60 * 1000); 
}