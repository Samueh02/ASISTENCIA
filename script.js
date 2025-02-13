document.addEventListener("DOMContentLoaded", () => {
    loadSubjects(); // Cargar asignaturas al abrir la página
});

function addSubject() {
    let name = document.getElementById("subjectName").value;
    let requiredAttendance = document.getElementById("requiredAttendance").value;

    if (name === "" || requiredAttendance === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
    subjects.push({
        name,
        requiredAttendance: parseInt(requiredAttendance),
        attended: 0,
        missed: 0
    });

    localStorage.setItem("subjects", JSON.stringify(subjects));
    loadSubjects();
}

function loadSubjects() {
    let scheduleBody = document.getElementById("scheduleBody");
    scheduleBody.innerHTML = "";

    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

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

        scheduleBody.innerHTML += row;
    });
}

function adjustAttendance(index, type, value) {
    let subjects = JSON.parse(localStorage.getItem("subjects"));

    if (type === "attended") {
        subjects[index].attended = Math.max(0, subjects[index].attended + value); // Evita valores negativos
    } else if (type === "missed") {
        subjects[index].missed = Math.max(0, subjects[index].missed + value); // Evita valores negativos
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
