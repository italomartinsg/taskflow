const taskCreationForm = document.querySelector("#form-criar-task");
const taskTitle = document.querySelector("#titulo-tarefa");
const taskList = document.querySelector(".task-fazer");

const tasks = [
  { id: 1, title: "Estudar JavaScript" },
  { id: 2, title: "Atualizar currículo" },
  { id: 3, title: "Treinar" },
];

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
    const btnRemove = document.createElement("button");

    taskItem.dataset.id = task.id;
    taskItem.textContent = task.title;

    btnRemove.textContent = "Remover";
    btnRemove.dataset.action = "remove";

    taskItem.appendChild(btnRemove);
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
function removeTask(id) {
  const indexTask = tasks.findIndex((task) => {
    return task.id === id;
  });
  if (indexTask !== -1) {
    tasks.splice(indexTask, 1);
    renderTasks();
  }
}

function handleTaskList(event) {
  if (event.target.dataset.action === "remove") {
    removeTask(+event.target.parentElement.dataset.id);
  }
}

renderTasks();

taskCreationForm.addEventListener("submit", handleCreateTask);
taskList.addEventListener("click", handleTaskList);
