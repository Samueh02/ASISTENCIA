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

    // 🔴 Verificación clave para evitar errores
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
    scheduleTableBody.innerHTML = "";

    // 🔴 Extraer las horas únicas y ordenarlas correctamente
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
        let row = `<tr>
            <td>${time}</td>
            <td>${schedule[`1-${time}`] || ""}</td>
            <td>${schedule[`2-${time}`] || ""}</td>
            <td>${schedule[`3-${time}`] || ""}</td>
            <td>${schedule[`4-${time}`] || ""}</td>
            <td>${schedule[`5-${time}`] || ""}</td>
            <td><button onclick="removeClassFromSchedule('${time}')">🗑️</button></td>
        </tr>`;

        scheduleTableBody.innerHTML += row;
    });

    console.log("📅 Horario cargado y ordenado:", schedule);
}


function removeClassFromSchedule(time) {
    let schedule = JSON.parse(localStorage.getItem("schedule")) || {};

    Object.keys(schedule).forEach(key => {
        if (key.includes(`-${time}`)) {
            delete schedule[key];
        }
    });

    localStorage.setItem("schedule", JSON.stringify(schedule));
    console.log(`❌ Clase eliminada a las ${time}`);
    loadSchedule();
}
function clearSchedule() {
    if (confirm("¿Estás seguro de que quieres vaciar todo el horario? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("schedule"); // 🗑️ Borra el horario almacenado
        loadSchedule(); // 🔄 Recarga la tabla vacía
        console.log("✅ Horario vaciado correctamente.");
    }
}
