const taskCreationForm = document.querySelector("#form-criar-tarefa");
const taskTitle = document.querySelector("#titulo-tarefa");
const taskList = document.querySelector(".task-fazer");
const taskPriority = document.querySelector("#prioridade-tarefa");
const taskDescription = document.querySelector("#descricao-tarefa");
const taskDueDate = document.querySelector("#prazo-tarefa");
const btnForm = document.querySelector("#btn-enviar-tarefa");
let editingTaskId = null;

const tasks = [
  {
    id: 1,
    title: "Estudar JavaScript",
    description: "Terminar o projeto TaskFlow",
    priority: "high",
    dueDate: "",
  },
  {
    id: 2,
    title: "Atualizar currículo",
    description: "Adicionar projetos finalizados",
    priority: "medium",
    dueDate: "2026-09-23",
  },
  {
    id: 3,
    title: "Treinar",
    description: "Ao menos 40min de exercício diário",
    priority: "high",
    dueDate: "2026-10-26",
  },
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
    const description = document.createElement("p");
    const priority = document.createElement("p");
    const dueDate = document.createElement("p");
    const btnEdit = document.createElement("button");
    const btnRemove = document.createElement("button");

    taskItem.dataset.id = task.id;
    taskItem.textContent = task.title;

    description.textContent = task.description;

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

    btnEdit.textContent = "Editar";
    btnEdit.dataset.action = "edit";

    btnRemove.textContent = "Remover";
    btnRemove.dataset.action = "remove";

    taskItem.appendChild(description);
    taskItem.appendChild(priority);
    if (task.dueDate) {
      dueDate.textContent =
        "Data de Entrega: " + task.dueDate.split("-").reverse().join("/");
      taskItem.appendChild(dueDate);
    }
    taskItem.appendChild(btnEdit);
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

  const currentDate = new Date();
  const arrayCurrentDate = [
    currentDate.getFullYear(),
    (currentDate.getMonth() + 1).toString().padStart(2, 0),
    currentDate.getDate().toString().padStart(2, 0),
  ];
  const currentDateTransform = arrayCurrentDate.join("-");

  if (taskDueDate.value !== "") {
    if (taskDueDate.value < currentDateTransform) {
      console.log("data da task é menor que a data de hoje");
      return;
    }
  }

  if (editingTaskId !== null) {
    const findIndexTaskEdit = tasks.findIndex((task) => {
      return task.id === editingTaskId;
    });

    if (findIndexTaskEdit !== -1) {
      const taskEditObj = {
        id: editingTaskId,
        title: title,
        description: taskDescription.value.trim(),
        priority: taskPriority.value,
        dueDate: taskDueDate.value,
      };
      tasks[findIndexTaskEdit] = taskEditObj;
    }
    editingTaskId = null;
    btnForm.textContent = "Enviar";
  } else {
    const taskObj = {
      id: getId(),
      title: title,
      description: taskDescription.value.trim(),
      priority: taskPriority.value,
      dueDate: taskDueDate.value,
    };

    tasks.push(taskObj);
  }
  taskTitle.value = "";
  taskDescription.value = "";
  taskPriority.value = "low";
  taskDueDate.value = "";
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

function editTask(id) {
  const taskFind = tasks.find((task) => {
    if (task.id === id) {
      return task;
    }
  });
  if (!taskFind) {
    return;
  }

  editingTaskId = id;
  taskTitle.value = taskFind.title;
  taskDescription.value = taskFind.description;
  taskPriority.value = taskFind.priority;
  taskDueDate.value = taskFind.dueDate;
  btnForm.textContent = "Salvar";
}

function handleTaskList(event) {
  if (event.target.dataset.action === "remove") {
    removeTask(+event.target.parentElement.dataset.id);
  }
  if (event.target.dataset.action === "edit") {
    editTask(+event.target.parentElement.dataset.id);
  }
}

renderTasks();

taskCreationForm.addEventListener("submit", handleCreateTask);
taskList.addEventListener("click", handleTaskList);
