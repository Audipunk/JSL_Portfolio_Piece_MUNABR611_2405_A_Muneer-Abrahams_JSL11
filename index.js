// Function to initialize data in localStorage if it's not already present
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'false'); // Set default sidebar visibility to hidden
  } else {
    console.log('Data already exists in localStorage');
  }
}

// DOM elements
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  modalTitleInput: document.getElementById('title-input'),
  modalDescInput: document.getElementById('desc-input'),
  modalSelectStatus: document.getElementById('select-status'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  filterDiv: document.getElementById('filterDiv'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  boardsContainer: document.getElementById('boards-nav-links-div'),
  addBoardInput: document.getElementById('add-board-input'),
  addBoardBtn: document.getElementById('add-board-btn')
};

let activeBoard = '';
let selectedTaskId = '';

// Fetches tasks from localStorage or an initial data source
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Fetches unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem('activeBoard'));
    activeBoard = localStorageBoard || boards[0]; // Set activeBoard to the first board by default
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Displays boards in the UI
function displayBoards(boards) {
  elements.boardsContainer.innerHTML = '';

  boards.forEach(board => {
    const boardElement = document.createElement('div');
    boardElement.classList.add('board-item');

    const boardButton = document.createElement('button');
    boardButton.textContent = board;
    boardButton.classList.add('board-btn');

    boardButton.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem('activeBoard', JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-board-btn');

    deleteButton.addEventListener('click', () => {
      deleteBoard(board);
    });

    boardElement.appendChild(boardButton);
    boardElement.appendChild(deleteButton);
    elements.boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks by board and displays them
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const columnDivs = document.querySelectorAll('.column-div');

  columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;
    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    const filteredTasks = tasks.filter(task => task.board === boardName && task.status === status);

    filteredTasks.forEach(task => {
      const taskElement = createTaskElement(task);
      tasksContainer.appendChild(taskElement);

      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });
    });
  });
}

// Refreshes the tasks UI
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Adds a task to the UI
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);

  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');

  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = createTaskElement(task);
  tasksContainer.appendChild(taskElement);

  taskElement.addEventListener('click', () => {
    openEditTaskModal(task);
  });
}

// Sets up event listeners
function setupEventListeners() {
  elements.cancelEditBtn.addEventListener('click', () => 
    {toggleModal(false, elements.editTaskModal);elements.filterDiv.style.display = 'none'});
  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  elements.themeSwitch.addEventListener('change', toggleTheme);

  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  });

  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });

  elements.saveTaskChangesBtn.addEventListener('click', saveTaskChanges);
  elements.deleteTaskBtn.addEventListener('click', deleteTask);

  elements.addBoardBtn.addEventListener('click', addNewBoard);
}

// Toggles the modal display
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

// Adds a new task
function addTask(event) {
  event.preventDefault();

  const task = {
    title: elements.modalTitleInput.value.trim(),
    description: elements.modalDescInput.value.trim(),
    status: elements.modalSelectStatus.value.trim(),
    id: generateTaskId(),
    board: activeBoard
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
    event.target.reset();
    refreshTasksUI();
    saveTasksToLocalStorage(); // Save tasks to localStorage after adding a new task
  }
}

// Generates a unique task ID
function generateTaskId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Toggles the sidebar display

function toggleSidebar(show) {
  const sideBar = document.getElementById('side-bar-div');
  const showSidebarBtn = document.getElementById('show-side-bar-btn');
  const hideSidebarBtn = document.getElementById('hide-side-bar-btn');

  if (show) {
    sideBar.style.display = 'block';
    showSidebarBtn.style.display = 'none';
    hideSidebarBtn.style.display = 'flex'; // Show the button to hide the sidebar
    localStorage.setItem('showSideBar', 'true');
  } else {
    sideBar.style.display = 'none';
    showSidebarBtn.style.display = 'flex';
    hideSidebarBtn.style.display = 'none'; // Hide the button to hide the sidebar
    localStorage.setItem('showSideBar', 'false');
  }
}


// Toggles the theme
function toggleTheme() {
  const currentTheme = document.body.classList.contains('light-theme') ? 'light-theme' : 'dark-theme';
  const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';

  document.body.classList.remove(currentTheme);
  document.body.classList.add(newTheme);

  localStorage.setItem('theme', newTheme);
}

// Applies the saved theme on page load
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light-theme' || savedTheme === 'dark-theme') {
    document.body.classList.add(savedTheme);
  } else {
    document.body.classList.add('light-theme');
  }
}

// Initializes the sidebar visibility based on localStorage
function initializeSidebar() {
  const showSideBar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSideBar);
}

// Opens the edit task modal and fills it with the selected task data
function openEditTaskModal(task) {
  selectedTaskId = task.id;
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;
  toggleModal(true, elements.editTaskModal);
  elements.filterDiv.style.display = 'block';
}

// Saves the changes made to a task
function saveTaskChanges() {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === selectedTaskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].title = elements.editTaskTitleInput.value.trim();
    tasks[taskIndex].description = elements.editTaskDescInput.value.trim();
    tasks[taskIndex].status = elements.editSelectStatus.value.trim();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
  }
}

// Deletes a task
function deleteTask() {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.id !== selectedTaskId);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  refreshTasksUI();
  toggleModal(false, elements.editTaskModal);
  elements.filterDiv.style.display = 'none';
}

// Adds a new board
function addNewBoard() {
  const newBoardName = elements.addBoardInput.value.trim();
  if (newBoardName) {
    const tasks = getTasks();
    tasks.push({ board: newBoardName, title: '', description: '', status: 'todo', id: generateTaskId() });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    fetchAndDisplayBoardsAndTasks();
    elements.addBoardInput.value = '';
  }
}

// Deletes a board and its associated tasks
function deleteBoard(boardName) {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.board !== boardName);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));

  if (activeBoard === boardName) {
    activeBoard = '';
    elements.headerBoardName.textContent = '';
  }

  fetchAndDisplayBoardsAndTasks();
}

// Initializes the application after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeData();
  applySavedTheme();
  setupEventListeners();
  initializeSidebar();
  fetchAndDisplayBoardsAndTasks();
});

// Sample implementation of createNewTask function
function createNewTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  return task;
}

// Sample implementation of createTaskElement function
function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');

  const taskTitle = document.createElement('h4');
  taskTitle.textContent = task.title;
  taskTitle.classList.add('task-title');

  taskElement.appendChild(taskTitle);
  // taskElement.appendChild(taskDescription);

  return taskElement;
}

// Save tasks to localStorage
function saveTasksToLocalStorage() {
  const tasks = getTasks();
  localStorage.setItem('tasks', JSON.stringify(tasks));
}