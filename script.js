document.addEventListener("DOMContentLoaded", () => {
    loadSubjects(); // Cargar las asignaturas al abrir la página
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
            <td>${subject.attended}</td>
            <td>${subject.missed}</td>
            <td>${attendancePercent}% / ${subject.requiredAttendance}%</td>
            <td>
                <button onclick="markAttendance(${index}, true)">✔️</button>
                <button onclick="markAttendance(${index}, false)">❌</button>
                <button onclick="deleteSubject(${index})">🗑️</button>
            </td>
        </tr>`;

        scheduleBody.innerHTML += row;
    });
}

function markAttendance(index, attended) {
    let subjects = JSON.parse(localStorage.getItem("subjects"));

    if (attended) {
        subjects[index].attended += 1;
    } else {
        subjects[index].missed += 1;
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
