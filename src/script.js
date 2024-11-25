// Clase para manejar las tareas
class TaskManager {
  constructor() {
    // Inicialización de variables y elementos del DOM
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.taskInput = document.getElementById('taskInput');
    this.dateInput = document.getElementById('dateInput');
    this.categoryInput = document.getElementById('categoryInput');
    this.addTaskBtn = document.getElementById('addTask');
    this.searchInput = document.getElementById('searchInput');
    this.filterStatus = document.getElementById('filterStatus');

    // Establecer fecha mínima en el input de fecha
    this.dateInput.min = new Date().toISOString().split('T')[0];

    // Inicializar eventos
    this.initializeEvents();
    // Renderizar tareas existentes
    this.renderTasks();
  }

  // Inicializar todos los event listeners
  initializeEvents() {
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.searchInput.addEventListener('input', () => this.filterTasks());
    this.filterStatus.addEventListener('change', () => this.filterTasks());

    // Eventos para el drag and drop
    document.querySelectorAll('.tasks-column').forEach(column => {
      column.addEventListener('dragover', this.allowDrop.bind(this));
      column.addEventListener('drop', this.drop.bind(this));
    });
  }

  // Añadir nueva tarea
  addTask() {
    const taskText = this.taskInput.value.trim();
    const taskDate = this.dateInput.value;
    const taskCategory = this.categoryInput.value;

    if (taskText === '') return;

    const newTask = {
      id: Date.now(),
      text: taskText,
      date: taskDate,
      category: taskCategory,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    this.saveTasks();
    this.renderTasks();
    this.clearInputs();
  }

  // Renderizar todas las tareas
  renderTasks() {
    const pendingContainer = document.querySelector('#pendingTasks .tasks-list');
    const completedContainer = document.querySelector('#completedTasks .tasks-list');

    // Limpiar contenedores
    pendingContainer.innerHTML = '';
    completedContainer.innerHTML = '';

    // Filtrar y renderizar tareas
    this.getFilteredTasks().forEach(task => {
      const taskElement = this.createTaskElement(task);
      if (task.completed) {
        completedContainer.appendChild(taskElement);
      } else {
        pendingContainer.appendChild(taskElement);
      }
    });
  }

  // Crear elemento HTML para una tarea
  createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.draggable = true;
    taskElement.dataset.id = task.id;
    taskElement.dataset.category = task.category;

    taskElement.innerHTML = `
            <div class="task-header">
                <span>${task.text}</span>
                <div class="task-actions">
                    <button onclick="taskManager.toggleTask(${task.id})">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button onclick="taskManager.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-date">
                <i class="far fa-calendar"></i> ${task.date || 'Sin fecha'}
            </div>
        `;

    // Eventos de drag and drop
    taskElement.addEventListener('dragstart', (e) => this.drag(e));
    taskElement.addEventListener('dragend', (e) => taskElement.classList.remove('dragging'));

    return taskElement;
  }

  // Obtener tareas filtradas según búsqueda y filtro
  getFilteredTasks() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const statusFilter = this.filterStatus.value;

    return this.tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' ||
          (statusFilter === 'completed' && task.completed) ||
          (statusFilter === 'pending' && !task.completed);

      return matchesSearch && matchesStatus;
    });
  }

  // Alternar estado de una tarea
  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  // Eliminar una tarea
  deleteTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
    this.renderTasks();
  }

  // Funciones para drag and drop
  drag(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
  }

  allowDrop(e) {
    e.preventDefault();
  }

  drop(e) {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    const task = this.tasks.find(t => t.id === taskId);
    const targetColumn = e.target.closest('.tasks-column');

    if (task && targetColumn) {
      task.completed = targetColumn.id === 'completedTasks';
      this.saveTasks();
      this.renderTasks();
    }
  }

  // Guardar tareas en localStorage
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  // Filtrar tareas
  filterTasks() {
    this.renderTasks();
  }

  // Limpiar inputs después de añadir tarea
  clearInputs() {
    this.taskInput.value = '';
    this.dateInput.value = '';
    this.categoryInput.value = 'personal';
  }
}

// Inicializar el TaskManager
const taskManager = new TaskManager();