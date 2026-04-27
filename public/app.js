const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const emptyMsg = document.getElementById('emptyMsg');

// load and render tasks
async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();

  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyMsg.classList.remove('d-none');
    taskCount.textContent = '';
    return;
  }

  emptyMsg.classList.add('d-none');

  let done = 0;
  tasks.forEach(function (task) {
    if (task.completed) done++;

    const li = document.createElement('li');
    li.className =
      'list-group-item d-flex align-items-center justify-content-between';
    if (task.completed) li.classList.add('task-done');

    // left side: checkbox + title + badge
    const left = document.createElement('div');
    left.className = 'd-flex align-items-center gap-2';

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'form-check-input mt-0';
    check.checked = task.completed;
    check.addEventListener('change', function () {
      toggleTask(task.id);
    });

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    left.appendChild(check);
    left.appendChild(title);

    if (task.completed) {
      const badge = document.createElement('span');
      badge.className = 'badge bg-success ms-2';
      badge.textContent = 'Done';
      left.appendChild(badge);
    }

    // right side: delete btn
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-outline-danger btn-sm';
    delBtn.title = 'Delete task';
    delBtn.innerHTML = '<i class="bi bi-trash"></i>';
    delBtn.addEventListener('click', function () {
      deleteTask(task.id);
    });

    li.appendChild(left);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });

  taskCount.textContent = done + ' / ' + tasks.length + ' completed';
}

// add a task
async function addTask(title) {
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title })
  });
  loadTasks();
}

// delete a task
async function deleteTask(id) {
  await fetch('/api/tasks/' + id, { method: 'DELETE' });
  loadTasks();
}

// toggle completed/pending
async function toggleTask(id) {
  await fetch('/api/tasks/' + id + '/toggle', { method: 'PUT' });
  loadTasks();
}

// form submit
taskForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (title) {
    addTask(title);
    taskInput.value = '';
    taskInput.focus();
  }
});

// first load
loadTasks();
