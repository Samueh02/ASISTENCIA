document.addEventListener("DOMContentLoaded", () => {
    loadSubjects(); // Cargar asignaturas correctamente
    generateTimeOptions(); // Generar opciones de horario con intervalos de 30 minutos
    loadSchedule(); // Cargar horario basado en clases existentes
});

/* ======================= ASISTENCIA ======================= */

function addSubject() {
    let name = document.getElementById("subjectName").value.trim();
    let requiredAttendance = document.getElementById("requiredAttendance").value.trim();

    if (name === "" || requiredAttendance === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    // Verificar si la asignatura ya existe
    let exists = subjects.some(subject => subject.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert("Esta asignatura ya ha sido añadida.");
        return;
    }

    subjects.push({
        name,
        requiredAttendance: parseInt(requiredAttendance),
        attended: 0,
        missed: 0
    });

    localStorage.setItem("subjects", JSON.stringify(subjects));
    document.getElementById("subjectName").value = "";
    document.getElementById("requiredAttendance").value = "";
    
    loadSubjects();
}

function loadSubjects() {
    let attendanceBody = document.getElementById("attendanceBody");
    if (!attendanceBody) {
        console.error("❌ ERROR: No se encontró 'attendanceBody' en el HTML.");
        return;
    }

    attendanceBody.innerHTML = "";

    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    if (subjects.length === 0) {
        attendanceBody.innerHTML = "<tr><td colspan='5'>No hay asignaturas registradas</td></tr>";
        return;
    }

    subjects.forEach((subject, index) => {
        let attendancePercent = subject.attended + subject.missed > 0 
            ? ((subject.attended / (subject.attended + subject.missed)) * 100).toFixed(2) 
            : 0;

        let row = `<tr>
            <td>${subject.name}</td>
            <td>
                ${subject.attended} 
                <button onclick="adjustAttendance(${index}, 'attended', 1)">➕</button>
                <button onclick="adjustAttendance(${index}, 'attended', -1)">➖</button>
            </td>
            <td>
                ${subject.missed} 
                <button onclick="adjustAttendance(${index}, 'missed', 1)">➕</button>
                <button onclick="adjustAttendance(${index}, 'missed', -1)">➖</button>
            </td>
            <td>${attendancePercent}% / ${subject.requiredAttendance}%</td>
            <td>
                <button onclick="deleteSubject(${index})">🗑️</button>
            </td>
        </tr>`;

        attendanceBody.innerHTML += row;
    });
}

function adjustAttendance(index, type, value) {
    let subjects = JSON.parse(localStorage.getItem("subjects"));

    if (type === "attended") {
        subjects[index].attended = Math.max(0, subjects[index].attended + value);
    } else if (type === "missed") {
        subjects[index].missed = Math.max(0, subjects[index].missed + value);
    }

    localStorage.setItem("subjects", JSON.stringify(subjects));
    loadSubjects();
}

function deleteSubject(index) {
    let subjects = JSON.parse(localStorage.getItem("subjects"));
    subjects.splice(index, 1);
    localStorage.setItem("subjects", JSON.stringify(subjects));
    loadSubjects();
}


/* ======================= HORARIO UNIVERSITARIO ======================= */
// 🎨 Generar colores aleatorios para asignaturas
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 🔹 Asignar y mantener colores para cada asignatura
function getSubjectColor(subjectName) {
    let colors = JSON.parse(localStorage.getItem("subjectColors")) || {};
    
    if (!colors[subjectName]) {
        colors[subjectName] = getRandomColor();
        localStorage.setItem("subjectColors", JSON.stringify(colors));
    }
    
    return colors[subjectName];
}

function generateTimeOptions() {
    let startTimeSelect = document.getElementById("startTime");
    let endTimeSelect = document.getElementById("endTime");
    startTimeSelect.innerHTML = "";
    endTimeSelect.innerHTML = "";

    for (let hour = 7; hour <= 22; hour++) {
        let times = [`${hour}:00`, `${hour}:30`];

        times.forEach(time => {
            let optionStart = document.createElement("option");
            optionStart.value = time;
            optionStart.textContent = time;
            startTimeSelect.appendChild(optionStart);

            let optionEnd = document.createElement("option");
            optionEnd.value = time;
            optionEnd.textContent = time;
            endTimeSelect.appendChild(optionEnd);
        });
    }
}

function addClassToSchedule() {
    let day = document.getElementById("day").value;
    let startTime = document.getElementById("startTime").value;
    let endTime = document.getElementById("endTime").value;
    let className = document.getElementById("className").value.trim();

    if (className === "" || startTime === "" || endTime === "") {
        alert("Por favor, ingresa todos los datos.");
        return;
    }

    let [startHour, startMin] = startTime.split(":").map(Number);
    let [endHour, endMin] = endTime.split(":").map(Number);

    if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
        alert("⛔ La hora de inicio debe ser menor que la hora de fin.");
        return;
    }

    let schedule = JSON.parse(localStorage.getItem("schedule")) || {};

    console.log(`📌 Agregando clase "${className}" de ${startTime} a ${endTime} en el día ${day}`);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        let formattedTime = `${currentHour}:${currentMin === 0 ? "00" : "30"}`;
        let key = `${day}-${formattedTime}`;

        schedule[key] = className;
        console.log(`✅ Guardado: ${key} -> ${className}`);

        currentMin += 30;
        if (currentMin === 60) {
            currentMin = 0;
            currentHour++;
        }
    }

    localStorage.setItem("schedule", JSON.stringify(schedule));
    console.log("🔄 Horario actualizado:", schedule);
    loadSchedule();
}

function loadSchedule() {
    let scheduleTableBody = document.getElementById("scheduleTableBody");
    if (!scheduleTableBody) {
        console.error("❌ ERROR: Elemento 'scheduleTableBody' no encontrado.");
        return;
    }

    let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
    let subjectColors = JSON.parse(localStorage.getItem("subjectColors")) || {};
    
    scheduleTableBody.innerHTML = "";

    let times = Object.keys(schedule)
        .map(key => key.split("-")[1])
        .filter(time => time)
        .sort((a, b) => {
            let [hourA, minA] = a.split(":").map(Number);
            let [hourB, minB] = b.split(":").map(Number);
            return hourA - hourB || minA - minB;
        });

    if (times.length === 0) {
        scheduleTableBody.innerHTML = "<tr><td colspan='7'>No hay clases programadas</td></tr>";
        return;
    }

    let uniqueTimes = [...new Set(times)];

    uniqueTimes.forEach(time => {
        let row = `<tr><td><strong>${time}</strong></td>`;

        for (let day = 1; day <= 5; day++) {
            let className = schedule[`${day}-${time}`] || "";
            let bgColor = className ? subjectColors[className] || getSubjectColor(className) : "transparent";

            row += `<td style="background-color: ${bgColor}; padding: 10px; border-radius: 5px; position: relative; cursor: pointer;"
                        ondblclick="editClassName('${day}', '${time}', this)"
                        onmouseover="showDeleteButton(this)"
                        onmouseout="hideDeleteButton(this)">
                        ${className ? `<span style="color: white; font-weight: bold;">${className}</span>` : ""}
                        ${className ? `<button class="delete-btn" onclick="removeSingleClass('${day}', '${time}')" 
                        style="display: none; position: absolute; top: 5px; right: 5px; background: rgba(220, 53, 69, 0.9); color: white; border: none; padding: 2px 6px; cursor: pointer; border-radius: 50%; font-size: 12px;">
                        ✖</button>` : ""}
                    </td>`;
        }

        row += `</tr>`;
        scheduleTableBody.innerHTML += row;
    });

    console.log("📅 Horario cargado y ordenado:", schedule);
}

// 🔹 Mostrar el botón eliminar solo al pasar el mouse
function showDeleteButton(cell) {
    let btn = cell.querySelector(".delete-btn");
    if (btn) btn.style.display = "inline-block";
}

// 🔹 Ocultar el botón eliminar cuando se sale del mouse
function hideDeleteButton(cell) {
    let btn = cell.querySelector(".delete-btn");
    if (btn) btn.style.display = "none";
}

function editClassName(day, time, cell) {
    let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
    let key = `${day}-${time}`;

    let currentText = schedule[key] || "";
    let input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.style.width = "80%";
    input.style.fontSize = "14px";
    input.style.fontWeight = "bold";
    input.style.border = "none";
    input.style.background = "rgba(255, 255, 255, 0.8)";
    input.style.color = "#333";
    input.style.textAlign = "center";

    input.addEventListener("blur", function () {
        let newValue = input.value.trim();
        if (newValue) {
            schedule[key] = newValue;
            localStorage.setItem("schedule", JSON.stringify(schedule));
            loadSchedule();
        } else {
            loadSchedule();
        }
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            input.blur();
        }
    });

    cell.innerHTML = "";
    cell.appendChild(input);
    input.focus();
}

function removeSingleClass(day, time) {
    let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
    let key = `${day}-${time}`;

    if (schedule[key]) {
        delete schedule[key];
    }

    localStorage.setItem("schedule", JSON.stringify(schedule));
    loadSchedule();
}

function clearSchedule() {
    if (confirm("¿Estás seguro de que quieres vaciar todo el horario? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("schedule");
        localStorage.removeItem("subjectColors");
        loadSchedule();
        console.log("✅ Horario vaciado correctamente.");
    }
}
