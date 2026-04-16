// Wrap everything to ensure DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    let tasks = [];
    let currentFilter = 'all';

    const taskInput = document.getElementById('task-input');
    const taskSchedule = document.getElementById('task-schedule');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearBtn = document.getElementById('clear-completed');

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
            schedule: schedule || null
        });

        saveTasks();
        taskInput.value = '';
        taskSchedule.value = '';
        renderTasks();
    }

    function renderTasks(data = null) {
        taskList.innerHTML = '';
        const list = data || getFiltered();

        if (list.length === 0) {
            taskList.innerHTML = '<div style="text-align:center; padding:30px; color:#cbd5e1;">No tasks yet</div>';
        } else {
            list.forEach(task => {
                const div = document.createElement('div');
                div.className = `task-item ${task.completed ? 'completed' : ''}`;
                div.innerHTML = `
                    <div class="checkbox"></div>
                    <div class="task-text">
                        <div>${task.text}</div>
                        ${task.schedule ? `<div class="task-time-tag">⏰ ${new Date(task.schedule).toLocaleString()}</div>` : ''}
                    </div>
                    <button class="delete-btn">×</button>
                `;

                div.querySelector('.checkbox').onclick = () => {
                    task.completed = !task.completed;
                    saveTasks();
                    renderTasks();
                };

                div.querySelector('.delete-btn').onclick = () => {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasks();
                    renderTasks();
                };

                taskList.appendChild(div);
            });
        }
        document.getElementById('task-count').innerText = `${tasks.filter(t => !t.completed).length} active tasks`;
    }

    function getFiltered() {
        if (currentFilter === 'active') return tasks.filter(t => !t.completed);
        if (currentFilter === 'completed') return tasks.filter(t => t.completed);
        return tasks;
    }

    // Event Listeners
    addBtn.onclick = addTask;
    taskInput.onkeypress = (e) => { if(e.key === 'Enter') addTask(); };

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
        const query = searchInput.value.toLowerCase();
        const filtered = getFiltered().filter(t => t.text.toLowerCase().includes(query));
        renderTasks(filtered);
    };

    // Initial Load
    loadTasks();
    console.log("SwiftCheck Initialized Successfully!");
});
