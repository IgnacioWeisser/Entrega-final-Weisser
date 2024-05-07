class Tarea {
    constructor(id, descripcion, completada, fechaCreacion) {
        this.id = id;
        this.descripcion = descripcion;
        this.completada = completada;
        this.fechaCreacion = fechaCreacion;
    }
}

let listaTareas = JSON.parse(localStorage.getItem('tareas')) || [];

function agregarTarea() {
    const input = document.getElementById("nuevaTareaInput");
    const descripcion = input.value.trim();
    if (descripcion) {
        const nuevaTarea = new Tarea(listaTareas.length + 1, descripcion, false, new Date().toISOString());
        listaTareas.push(nuevaTarea);
        localStorage.setItem('tareas', JSON.stringify(listaTareas));
        actualizarTablaTareas();
        input.value = "";  // Clear the input after adding
        Swal.fire({
            title: '¡Éxito!',
            text: 'Tarea agregada correctamente',
            icon: 'success'
        });
    } else {
        Swal.fire({
            title: 'Error',
            text: 'La descripción de la tarea no puede estar vacía.',
            icon: 'error'
        });
    }
}

function actualizarTablaTareas() {
    const tbody = document.getElementById('tablaTareas').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';  // Clear previous rows
    listaTareas.forEach(tarea => {
        let row = tbody.insertRow();
        row.insertCell(0).textContent = tarea.id;
        row.insertCell(1).textContent = tarea.descripcion;
        row.insertCell(2).textContent = tarea.fechaCreacion;
        let completarCell = row.insertCell(3);
        if (!tarea.completada) {
            let completarBtn = document.createElement('button');
            completarBtn.textContent = 'Completar';
            completarBtn.onclick = function() { completarTarea(tarea.id); };
            completarCell.appendChild(completarBtn);
        } else {
            completarCell.textContent = 'Completada';
        }
    });
}

function completarTarea(id) {
    const tarea = listaTareas.find(t => t.id === id);
    if (tarea && !tarea.completada) {
        tarea.completada = true;
        tarea.fechaCompletada = new Date().toISOString();
        localStorage.setItem('tareas', JSON.stringify(listaTareas));
        actualizarTablaTareas();
        // Alerta de SweetAlert para confirmar que la tarea ha sido completada
        Swal.fire({
            title: '¡Tarea Completada!',
            text: 'La tarea ha sido marcada como completada.',
            icon: 'success',
            confirmButtonText: 'Ok'
        });
    } else if (tarea && tarea.completada) {
        // Si la tarea ya estaba completada, informar al usuario
        Swal.fire({
            title: 'Tarea ya completada',
            text: 'Esta tarea ya fue completada anteriormente.',
            icon: 'info',
            confirmButtonText: 'Entendido'
        });
    }
}

document.getElementById("agregarBtn").addEventListener("click", agregarTarea);
document.addEventListener("DOMContentLoaded", actualizarTablaTareas);