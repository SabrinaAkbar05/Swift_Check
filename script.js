let tasks = [];
let currentFilter = 'all';

const taskInput = document.getElementById('task-input');
const taskSchedule = document.getElementById('task-schedule');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clear-completed');

window.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  setInterval(checkSchedules, 30000);
});

function saveTasks() {
  localStorage.setItem('swiftcheck_tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('swiftcheck_tasks');
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

  displayList.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    let timeHtml = task.schedule ? `<div class="task-time-tag">⏰ ${new Date(task.schedule).toLocaleString()}</div>` : '';

    item.innerHTML = `
      <div class="checkbox"></div>
      <div class="task-text">
        <div>${task.text}</div>
        ${timeHtml}
      </div>
      <button class="delete-btn">×</button>
    `;

    item.querySelector('.checkbox').onclick = () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    };

    item.querySelector('.delete-btn').onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    };
    
    taskList.appendChild(item);
  });
  updateCount();
}

function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function updateCount() {
  const activeCount = tasks.filter(t => !t.completed).length;
  document.getElementById('task-count').textContent = `${activeCount} active tasks`;
}

function checkSchedules() {
  const now = new Date();
  tasks.forEach(task => {
    if (task.schedule && !task.completed && !task.notified) {
      if (now >= new Date(task.schedule)) {
        if (Notification.permission === "granted") {
          new Notification("SwiftCheck Reminder", { body: task.text });
        }
        task.notified = true;
        saveTasks();
        renderTasks();
      }
    }
  });
}

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

searchInput.oninput = () => {
  const val = searchInput.value.toLowerCase();
  const filtered = getFilteredTasks().filter(t => t.text.toLowerCase().includes(val));
  renderTasks(filtered);
};

clearBtn.onclick = () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
};
