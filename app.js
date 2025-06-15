const dashboardEl = document.getElementById("dashboard");
const taskListEl = document.getElementById("taskList");
const allCountEl = document.getElementById("allCount");
const activeCountEl = document.getElementById("activeCount");
const completedCountEl = document.getElementById("completedCount");
const overdueCountEl = document.getElementById("overdueCount");
const fabButton = document.getElementById("fabButton");
const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const titleInput = document.getElementById("taskTitleInput");
const descInput = document.getElementById("taskDescInput");
const dateInput = document.getElementById("taskDateInput");
const timeInput = document.getElementById("taskTimeInput");
const priorityInput = document.getElementById("taskPriorityInput");
const saveBtn = document.getElementById("saveTaskBtn");
const cancelBtn = document.getElementById("cancelModalBtn");
const taskListTitle = document.getElementById("taskListTitle");

let tasks = [];
let editingIndex = null;
let filter = "all";

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}



function closePopup(popupId) {
    document.getElementById(popupId).classList.add('hidden');
}

function addTask() {
    closePopup('header-popup-dashboard');
    openModal();
}

function clearCompleted() {
  if (confirm("Clear all completed tasks?")) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }
}

function clearOverdue() {
  if (confirm("Clear all overdue tasks?")) {
    tasks = tasks.filter(t => !isOverdue(t));
    saveTasks();
    render();
  }
}

function refresh() {
  closePopup('header-popup-dashboard');
  loadTasks();
  render();
}

function deleteAll() {
  closePopup('header-popup-dashboard');
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    saveTasks();
    render();
  }
}

// Close popups when clicking outside
document.addEventListener('click', function (event) {
    if (!event.target.closest('.task-menu') && !event.target.closest('.header-menu') && !event.target.closest('.task-popup') && !event.target.closest('.header-popup')) {
        document.querySelectorAll('.task-popup, .header-popup').forEach(popup => {
            popup.classList.add('hidden');
        });
    }
});



function isOverdue(task) {
  if (task.completed) return false;
  const now = new Date();
  const due = task.dueTime ? new Date(`${task.dueDate}T${task.dueTime}`) : new Date(task.dueDate);
  return due < now;
}

function getFilteredTasks() {
  switch (filter) {
    case "active": return tasks.filter(t => !t.completed && !isOverdue(t));
    case "completed": return tasks.filter(t => t.completed);
    case "overdue": return tasks.filter(t => isOverdue(t));
    default: return tasks;
  }
}

function clearCompleted() {
  if (confirm("Clear all completed tasks?")) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }
}

function clearOverdue() {
  if (confirm("Clear all overdue tasks?")) {
    tasks = tasks.filter(t => !isOverdue(t));
    saveTasks();
    render();
  }
}

function render() {
  allCountEl.textContent = tasks.length;
  activeCountEl.textContent = tasks.filter(t => !t.completed && !isOverdue(t)).length;
  completedCountEl.textContent = tasks.filter(t => t.completed).length;
  overdueCountEl.textContent = tasks.filter(t => isOverdue(t)).length;

  const contentAreas = document.querySelectorAll(".task-content");
  const filteredTasks = getFilteredTasks();
  if (taskListTitle) {
    const label = `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`;
    taskListTitle.innerHTML = `${label}
      ${(filter === 'completed') ? '<button onclick="clearCompleted()" class="focus:outline-none ml-20 text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1.5 me-1 mb-1 dark:bg-red-500 dark:hover:bg-red-700 dark:focus:ring-red-900">Clear Completed</button>' : ''}
      ${(filter === 'overdue') ? '<button onclick="clearOverdue()" class="focus:outline-none ml-[110px] text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1.5 me-1 mb-1 dark:bg-red-500 dark:hover:bg-red-700 dark:focus:ring-red-900">Clear Overdue</button>' : ''}`;
  }

  let html = "";
  if (filteredTasks.length === 0) {
    html = `
      <div class='text-center text-gray-500 bg-white rounded-lg p-6 shadow'>
        <p>No ${filter} tasks found.</p>
        <button onclick="openModal()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Add Task</button>
      </div>`;
  } else {
    html = filteredTasks.map((task, i) => {
      const actualIndex = tasks.findIndex(t => t.title === task.title && t.description === task.description && t.dueDate === task.dueDate);
      const overdue = isOverdue(task);
      return `
        <div class="task-card bg-white p-4 rounded-lg shadow flex items-start relative" draggable="true" ondragstart="onDragStart(event, ${actualIndex})" ondragover="onDragOver(event)" ondrop="onDrop(event, ${actualIndex})">
          <input type="checkbox" class="mr-3 w-5 h-5 rounded-full border-2 border-blue-500 mt-1" onclick="toggleComplete(${actualIndex})" ${task.completed ? 'checked' : ''}>
          <div>
            <p class="text-sm text-gray-500">Due: ${task.dueDate}${task.dueTime ? ' • ' + task.dueTime : ''} ${overdue ? '<span class=\"text-red-500\">(Overdue)</span>' : ''}</p>
            <p class="font-semibold ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</p>
            <p class="text-sm text-gray-600">${task.description}</p>
            ${task.priority ? `<p class='text-xs text-gray-500 mt-1'>Priority: ${task.priority}</p>` : ''}
          </div>
          <span class="task-menu" onclick="togglePopup('popup-${i}')">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </span>
          <div id="popup-${i}" class="task-popup hidden">
            <button class="edit" onclick="openModal(${actualIndex})">Edit</button>
            <hr>
            <button class="delete" onclick="deleteTask(${actualIndex})">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  }

  contentAreas.forEach(area => area.innerHTML = html);
}

let draggedIndex = null;

function onDragStart(event, index) {
  draggedIndex = index;
}

function onDragOver(event) {
  event.preventDefault();
}

function onDrop(event, targetIndex) {
  if (draggedIndex === null || draggedIndex === targetIndex) return;
  const movedTask = tasks.splice(draggedIndex, 1)[0];
  tasks.splice(targetIndex, 0, movedTask);
  saveTasks();
  render();
  draggedIndex = null;
}

function togglePopup(id) {
  document.querySelectorAll('.task-popup, .header-popup').forEach(p => p.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden');
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  render();
}

function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    render();
  }
}

function openModal(index = null) {
  editingIndex = index;
  if (index !== null) {
    const task = tasks[index];
    modalTitle.textContent = "Edit Task";
    titleInput.value = task.title;
    descInput.value = task.description;
    dateInput.value = task.dueDate;
    timeInput.value = task.dueTime || "";
    priorityInput.value = task.priority || "";
  } else {
    modalTitle.textContent = "Add New Task";
    titleInput.value = "";
    descInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    priorityInput.value = "";
  }
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  editingIndex = null;
}

saveBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const dueDate = dateInput.value;
  const dueTime = timeInput.value;
  const priority = priorityInput.value;

  if (!title || !dueDate) return alert("Please fill in title and due date.");

  const taskData = { title, description, dueDate, dueTime, priority, completed: false };

  if (editingIndex !== null) {
    tasks[editingIndex] = { ...tasks[editingIndex], ...taskData };
  } else {
    tasks.push(taskData);
  }

  saveTasks();
  render();
  closeModal();
});

cancelBtn.addEventListener("click", closeModal);
fabButton.addEventListener("click", () => openModal());


allCountEl.parentElement.parentElement.addEventListener("click", () => { filter = "all"; render(); });
activeCountEl.parentElement.parentElement.addEventListener("click", () => { filter = "active"; render(); });
completedCountEl.parentElement.parentElement.addEventListener("click", () => { filter = "completed"; render(); });
overdueCountEl.parentElement.parentElement.addEventListener("click", () => { filter = "overdue"; render(); });

loadTasks();
render();

