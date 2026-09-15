const taskCreationForm = document.querySelector("#form-criar-task");
const taskTitle = document.querySelector("#titulo-tarefa");
const taskList = document.querySelector(".task-fazer");
const taskPriority = document.querySelector("#prioridade-task");

const tasks = [
  { id: 1, title: "Estudar JavaScript", priority: "high" },
  { id: 2, title: "Atualizar currículo", priority: "medium" },
  { id: 3, title: "Treinar", priority: "high" },
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
    const priority = document.createElement("p");

    taskItem.dataset.id = task.id;
    taskItem.textContent = task.title;

    btnRemove.textContent = "Remover";
    btnRemove.dataset.action = "remove";

    switch (task.priority) {
      case "medium":
        priority.textContent = `Prioridade: Média`;
        break;
      case "high":
        priority.textContent = `Prioridade: Alta`;
        break;
      default:
        priority.textContent = `Prioridade: Baixa`;
        break;
    }

    taskItem.appendChild(priority);
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
    priority: taskPriority.value,
  };

  tasks.push(taskObj);
  taskTitle.value = "";
  taskPriority.value = "low";
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
