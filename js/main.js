const taskCreationForm = document.querySelector("#form-criar-tarefa");
const taskTitle = document.querySelector("#titulo-tarefa");
const taskPriority = document.querySelector("#prioridade-tarefa");
const taskDescription = document.querySelector("#descricao-tarefa");
const taskDueDate = document.querySelector("#prazo-tarefa");
const btnForm = document.querySelector("#btn-enviar-tarefa");
const columnsTask = document.querySelectorAll("[data-status]");
const filterTask = document.querySelector("#task-filter");
const modal = document.querySelector("#modal-formulario");
const btnNewTask = document.querySelector("#nova-tarefa");

let editingTaskId = null;
let currentPriorityFilter = "all";
const tasks = [];

function loadTasksFromStorage() {
  const storedTasks = localStorage.getItem("taskflow-tasks");
  if (storedTasks) {
    try {
      const storedTasksObj = JSON.parse(storedTasks);
      if (Array.isArray(storedTasksObj)) {
        tasks.push(...storedTasksObj);
      } else {
        localStorage.removeItem("taskflow-tasks");
      }
    } catch (error) {
      console.log(error, "não foi possivel puxar os dados do localStorage");
    }
  }
}

function renderFilteredTasks() {
  if (currentPriorityFilter === "all") {
    renderTasks(tasks);
  } else {
    const taskCurrentPriorityFilter = tasks.filter((task) => {
      return task.priority === currentPriorityFilter;
    });
    renderTasks(taskCurrentPriorityFilter);
  }
}
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

function renderTasks(currentTask) {
  columnsTask.forEach((column) => {
    column.textContent = "";
  });
  if (!currentTask) {
    currentTask = tasks;
  }

  currentTask.forEach((task) => {
    let correctList;
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

    columnsTask.forEach((column) => {
      if (task.status === column.dataset.status) {
        correctList = column;
        return;
      }
    });
    taskItem.setAttribute("draggable", "true");
    taskItem.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", taskItem.dataset.id);
    });

    correctList.appendChild(taskItem);
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
        status: tasks[findIndexTaskEdit].status,
      };
      tasks[findIndexTaskEdit] = taskEditObj;
      saveTasksOnStorage();
      modal.close();
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
      status: "todo",
    };

    tasks.push(taskObj);
    modal.close();
    saveTasksOnStorage();
  }
  taskTitle.value = "";
  taskDescription.value = "";
  taskPriority.value = "low";
  taskDueDate.value = "";
  renderFilteredTasks();
}

function removeTask(id) {
  const indexTask = tasks.findIndex((task) => {
    return task.id === id;
  });
  if (indexTask !== -1) {
    tasks.splice(indexTask, 1);
    saveTasksOnStorage();
    renderFilteredTasks();
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
  modal.showModal();
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

function saveTasksOnStorage() {
  const stringTasks = JSON.stringify(tasks);
  localStorage.setItem("taskflow-tasks", stringTasks);
}

taskCreationForm.addEventListener("submit", handleCreateTask);
filterTask.addEventListener("change", () => {
  currentPriorityFilter = filterTask.value;
  renderFilteredTasks();
});
columnsTask.forEach((column) => {
  column.addEventListener("click", handleTaskList);
  column.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  column.addEventListener("drop", (event) => {
    const taskId = +event.dataTransfer.getData("text/plain");
    const taskFound = tasks.find((task) => {
      return task.id === taskId;
    });
    if (taskFound) {
      taskFound.status = column.dataset.status;
      saveTasksOnStorage();
      renderFilteredTasks();
    }
  });
});
btnNewTask.addEventListener("click", () => {
  editingTaskId = null;
  taskTitle.value = "";
  taskDescription.value = "";
  taskPriority.value = "low";
  taskDueDate.value = "";
  btnForm.textContent = "Enviar";
  modal.showModal();
});

loadTasksFromStorage();
renderFilteredTasks();
