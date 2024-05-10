document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("agregarBtn").addEventListener("click", solicitarPrioridad);
    document.getElementById("fetchUser").addEventListener("click", fetchRandomUser);
    cargarTareas();
});

let currentUser = null;

function fetchRandomUser() {
    fetch('https://randomuser.me/api/')
        .then(response => response.json())
        .then(data => {
            const user = data.results[0];
            currentUser = {
                name: `${user.name.first} ${user.name.last}`,
                age: user.dob.age,
                country: user.location.country,
                picture: user.picture.large
            };
            document.getElementById("userInfo").innerHTML = `<div>Asignado a: ${currentUser.name} (${currentUser.age} años, ${currentUser.country})</div> <img src="${currentUser.picture}" alt="User Image" style="width: 100px; height: 100px; border-radius: 50%;">`;
            document.getElementById("nuevaTareaInput").disabled = false;
            document.getElementById("agregarBtn").disabled = false;
        })
        .catch(error => console.error('Error fetching user:', error));
}

function solicitarPrioridad() {
    if (!currentUser) {
        Swal.fire('Error', 'Obtén un usuario antes de agregar tareas.', 'error');
        return;
    }
    const descripcion = document.getElementById("nuevaTareaInput").value.trim();
    if (!descripcion) {
        Swal.fire('Error', 'Debe ingresar una descripción para la tarea.', 'error');
        return;
    }
    Swal.fire({
        title: 'Selecciona la prioridad de la tarea',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Alta',
        denyButtonText: 'Media',
        cancelButtonText: 'Baja',
        reverseButtons: true
    }).then((result) => {
        let prioridad = 'Baja';
        if (result.isConfirmed) {
            prioridad = 'Alta';
        } else if (result.isDenied) {
            prioridad = 'Media';
        }
        agregarTarea(descripcion, prioridad);
    });
}

function agregarTarea(descripcion, prioridad) {
    const nuevaTarea = new Tarea(tareasActivas.length + 1, descripcion, prioridad, false, new Date().toLocaleString(), null, currentUser.name, currentUser.age, currentUser.country, currentUser.picture);
    tareasActivas.push(nuevaTarea);
    tareasActivas.sort((a, b) => (b.prioridad === "Alta") - (a.prioridad === "Alta") || (b.prioridad === "Media") - (a.prioridad === "Media"));
    localStorage.setItem('tareasActivas', JSON.stringify(tareasActivas));
    actualizarTablaTareas();
    document.getElementById("nuevaTareaInput").value = "";
    Swal.fire('Tarea agregada!', '', 'success');
}

function cargarTareas() {
    tareasActivas = JSON.parse(localStorage.getItem('tareasActivas')) || [];
    tareasCompletadas = JSON.parse(localStorage.getItem('tareasCompletadas')) || [];
    actualizarTablaTareas();
}

function actualizarTablaTareas() {
    const tbodyActive = document.getElementById('tablaTareas').getElementsByTagName('tbody')[0];
    tbodyActive.innerHTML = '';
    tareasActivas.forEach(tarea => {
        let row = tbodyActive.insertRow();
        let imgCell = row.insertCell(0);
        imgCell.innerHTML = `<img src="${tarea.assignedPicture}" alt="User Image">`;
        row.insertCell(1).textContent = tarea.id;
        row.insertCell(2).textContent = tarea.descripcion;
        row.insertCell(3).textContent = tarea.prioridad;
        row.insertCell(4).textContent = tarea.fechaCreacion;
        row.insertCell(5).textContent = tarea.assignedName;
        row.insertCell(6).textContent = tarea.assignedAge;
        row.insertCell(7).textContent = tarea.assignedCountry;
        let accionesCell = row.insertCell(8);
        let completarBtn = document.createElement('button');
        completarBtn.textContent = 'Completar';
        completarBtn.onclick = () => completarTarea(tarea.id);
        accionesCell.appendChild(completarBtn);
    });

    const tbodyCompleted = document.getElementById('tareasCompletadas').getElementsByTagName('tbody')[0];
    tbodyCompleted.innerHTML = '';
    tareasCompletadas.forEach(tarea => {
        let row = tbodyCompleted.insertRow();
        let imgCell = row.insertCell(0);
        imgCell.innerHTML = `<img src="${tarea.assignedPicture}" alt="User Image">`;
        row.insertCell(1).textContent = tarea.id;
        row.insertCell(2).textContent = tarea.descripcion;
        row.insertCell(3).textContent = tarea.prioridad;
        row.insertCell(4).textContent = tarea.fechaCompletada;
        row.insertCell(5).textContent = tarea.assignedName;
        row.insertCell(6).textContent = tarea.assignedAge;
        row.insertCell(7).textContent = tarea.assignedCountry;
        let accionesCell = row.insertCell(8);
        let deshacerBtn = document.createElement('button');
        deshacerBtn.textContent = 'Deshacer';
        deshacerBtn.onclick = () => deshacerTarea(tarea.id);
        accionesCell.appendChild(deshacerBtn);
    });
}

function completarTarea(id) {
    const tareaIndex = tareasActivas.findIndex(t => t.id === id);
    if (tareaIndex > -1) {
        tareasActivas[tareaIndex].completada = true;
        tareasActivas[tareaIndex].fechaCompletada = new Date().toLocaleString();
        tareasCompletadas.push(tareasActivas[tareaIndex]);
        tareasCompletadas.sort((a, b) => (b.prioridad === "Alta") - (a.prioridad === "Alta") || (b.prioridad === "Media") - (a.prioridad === "Media"));
        tareasActivas.splice(tareaIndex, 1);
        localStorage.setItem('tareasActivas', JSON.stringify(tareasActivas));
        localStorage.setItem('tareasCompletadas', JSON.stringify(tareasCompletadas));
        actualizarTablaTareas();
        Swal.fire('Tarea completada!', '', 'success');
    }
}

function deshacerTarea(id) {
    const tareaIndex = tareasCompletadas.findIndex(t => t.id === id);
    if (tareaIndex > -1) {
        tareasCompletadas[tareaIndex].completada = false;
        delete tareasCompletadas[tareaIndex].fechaCompletada;
        tareasActivas.push(tareasCompletadas[tareaIndex]);
        tareasActivas.sort((a, b) => (b.prioridad === "Alta") - (a.prioridad === "Alta") || (b.prioridad === "Media") - (a.prioridad === "Media"));
        tareasCompletadas.splice(tareaIndex, 1);
        localStorage.setItem('tareasActivas', JSON.stringify(tareasActivas));
        localStorage.setItem('tareasCompletadas', JSON.stringify(tareasCompletadas));
        actualizarTablaTareas();
        Swal.fire('Tarea restaurada!', '', 'success');
    }
}

class Tarea {
    constructor(id, descripcion, prioridad, completada, fechaCreacion, fechaCompletada = null, assignedName, assignedAge, assignedCountry, assignedPicture) {
        this.id = id;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.completada = completada;
        this.fechaCreacion = fechaCreacion;
        this.fechaCompletada = fechaCompletada;
        this.assignedName = assignedName;
        this.assignedAge = assignedAge;
        this.assignedCountry = assignedCountry;
        this.assignedPicture = assignedPicture;
    }
}