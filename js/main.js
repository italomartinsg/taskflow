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
const formErrors = document.querySelectorAll(".form-error");
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
    const taskTitle = document.createElement("h3");
    const description = document.createElement("p");
    const priority = document.createElement("p");
    const dueDate = document.createElement("p");
    const btnEdit = document.createElement("button");
    const btnRemove = document.createElement("button");
    const label = document.createElement("label");
    const select = document.createElement("select");
    const todoOption = document.createElement("option");
    const inProgressOption = document.createElement("option");
    const doneOption = document.createElement("option");

    taskItem.dataset.id = task.id;
    taskTitle.textContent = task.title;
    taskTitle.classList.add("task-title");
    taskItem.appendChild(taskTitle);

    description.textContent = task.description;
    description.classList.add("task-description");
    taskItem.appendChild(description);

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
    priority.classList.add("task-priority", `task-priority-${task.priority}`);
    taskItem.appendChild(priority);

    if (task.dueDate) {
      dueDate.classList.add("task-due-date");
      dueDate.textContent =
        "Data de Entrega: " + task.dueDate.split("-").reverse().join("/");

      taskItem.appendChild(dueDate);
    }

    label.setAttribute("for", `change-status-${task.id}`);
    label.classList.add("task-status-control");
    label.textContent = " Alterar status:";
    taskItem.appendChild(label);

    select.setAttribute("name", "change-status");
    select.setAttribute("id", `change-status-${task.id}`);
    select.classList.add("task-status-control");
    todoOption.value = "todo";
    todoOption.textContent = "A fazer";
    inProgressOption.value = "in-progress";
    inProgressOption.textContent = "Em Andamento";
    doneOption.value = "done";
    doneOption.textContent = "Concluída";

    select.append(todoOption, inProgressOption, doneOption);

    select.value = task.status;
    taskItem.appendChild(select);
    select.addEventListener("change", () => {
      task.status = select.value;
      saveTasksOnStorage();
      renderFilteredTasks();
    });

    btnEdit.textContent = "Editar";
    btnEdit.dataset.action = "edit";
    btnEdit.classList.add("btn-task", "btn-task-edit");
    taskItem.appendChild(btnEdit);

    btnRemove.textContent = "Remover";
    btnRemove.dataset.action = "remove";
    btnRemove.classList.add("btn-task", "btn-task-remove");
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
    taskItem.classList.add(task.status);

    if (correctList) {
      correctList.appendChild(taskItem);
    }
  });
  columnsTask.forEach((column) => {
    if (column.children.length === 0) {
      const noTasksMessage = document.createElement("p");
      noTasksMessage.textContent = "Nenhuma Tarefa";
      noTasksMessage.style.textAlign = "center";
      column.appendChild(noTasksMessage);
    }
  });
}

function handleCreateTask(event) {
  event.preventDefault();
  clearErrorForm();

  const title = taskTitle.value.trim();

  if (!title) {
    showError("title", "Preencha um título para a tarefa.");
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
      showError("date", "Selecione o dia atual ou uma data futura.");
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
      clearErrorForm();
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
    clearErrorForm();
    saveTasksOnStorage();
  }
  taskTitle.value = "";
  taskDescription.value = "";
  taskPriority.value = "low";
  taskDueDate.value = "";
  renderFilteredTasks();
}

function showError(element, message) {
  formErrors.forEach((error) => {
    if (error.dataset.errorLocation === element) {
      error.textContent = message;
    }
  });
}
function clearErrorForm() {
  formErrors.forEach((error) => {
    error.textContent = "";
  });
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
modal.addEventListener("close", () => {
  clearErrorForm();
});

loadTasksFromStorage();
renderFilteredTasks();
