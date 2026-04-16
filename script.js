let tasks = [];
let currentFilter = 'all';

// Load elements
const taskInput = document.getElementById('task-input');
const taskSchedule = document.getElementById('task-schedule');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clear-completed');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  
  // Request Notification permission
  if ("Notification" in window) {
    Notification.requestPermission();
  }
  
  // Background check for scheduled tasks
  setInterval(checkSchedules, 30000);
});

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  tasks = saved ? JSON.parse(saved) : [];
  renderTasks();
}

function addTask() {
  const text = taskInput.value.trim();
  const schedule = taskSchedule.value;

  if (!text) return;

  tasks.unshift({
    id: Date.now(),
    text: text,
    completed: false,
    schedule: schedule || null,
    notified: false
  });

  saveTasks();
  taskInput.value = '';
  taskSchedule.value = '';
  renderTasks();
}

function renderTasks(filteredList = null) {
  taskList.innerHTML = '';
  const displayList = filteredList || getFilteredTasks();

  if (displayList.length === 0) {
    taskList.innerHTML = '<div class="empty-state">No tasks here</div>';
  } else {
    displayList.forEach(task => {
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'completed' : ''}`;
      
      let timeHtml = task.schedule ? `<div class="task-time-tag">⏰ ${new Date(task.schedule).toLocaleString()}</div>` : '';

      item.innerHTML = `
        <div class="checkbox"></div>
        <div class="task-text">
          <div>${escapeHTML(task.text)}</div>
          ${timeHtml}
        </div>
        <button class="delete-btn">×</button>
      `;

      item.querySelector('.checkbox').onclick = () => toggleTask(task.id);
      item.querySelector('.delete-btn').onclick = () => deleteTask(task.id);
      
      taskList.appendChild(item);
    });
  }
  updateCount();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function updateCount() {
  const activeCount = tasks.filter(t => !t.completed).length;
  document.getElementById('task-count').textContent = `${activeCount} active task${activeCount !== 1 ? 's' : ''}`;
}

function checkSchedules() {
  const now = new Date();
  let changed = false;

  tasks.forEach(task => {
    if (task.schedule && !task.completed && !task.notified) {
      if (now >= new Date(task.schedule)) {
        if (Notification.permission === "granted") {
          new Notification("Task Reminder", { body: task.text });
        }
        task.notified = true;
        changed = true;
      }
    }
  });

  if (changed) {
    saveTasks();
    renderTasks();
  }
}

function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

// Events
addBtn.onclick = addTask;
taskInput.onkeydown = (e) => { if (e.key === 'Enter') addTask(); };

filterBtns.forEach(btn => {
  btn.onclick = () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  };
});

clearBtn.onclick = () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
};

searchInput.oninput = () => {
  const val = searchInput.value.toLowerCase();
  const filtered = getFilteredTasks().filter(t => t.text.toLowerCase().includes(val));
  renderTasks(filtered);
};