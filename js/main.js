const taskCreationForm = document.querySelector("#form-criar-task");
const taskTitle = document.querySelector("#titulo-tarefa");
const taskList = document.querySelector(".task-fazer");

const tasks = [];

function getId() {
  const highestId = tasks.reduce((accumulator, currentValue) => {
    if (accumulator < currentValue.id) {
      accumulator = currentValue.id;
      return accumulator;
    }
    return accumulator;
  }, 0);
  return highestId + 1;
}

function renderTasks() {
  taskList.textContent = "";
  tasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.textContent = task.title;
    taskList.appendChild(taskItem);
  });
}

function handleCreateTask(event) {
  event.preventDefault();
  const title = taskTitle.value.trim();

  if (!title) {
    return;
  }
  const taskObj = {
    id: getId(),
    title: title,
  };
  tasks.push(taskObj);
  taskTitle.value = "";
  renderTasks();
}

taskCreationForm.addEventListener("submit", handleCreateTask);
