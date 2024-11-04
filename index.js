function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'false'); // 1
  } else {
    console.log('Data already exists in localStorage');
  }
}
// 2
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
// 3
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}
// 4
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem('activeBoard'));
    activeBoard = localStorageBoard || boards[0];        //4.1
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}
// 5
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
    const deleteButton = document.createElement('button');                //5.1
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
// 6
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
// 7
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}
// 8
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}
// 9
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
// 10
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
// 11
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}
// 12
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
    saveTasksToLocalStorage(); // 12.1
  }
}
// 13
function generateTaskId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
// 14
function toggleSidebar(show) {
  const sideBar = document.getElementById('side-bar-div');
  const showSidebarBtn = document.getElementById('show-side-bar-btn');
  const hideSidebarBtn = document.getElementById('hide-side-bar-btn');
  if (show) {
    sideBar.style.display = 'block';
    showSidebarBtn.style.display = 'none';
    hideSidebarBtn.style.display = 'flex'; // 14.1
    localStorage.setItem('showSideBar', 'true');
  } else {
    sideBar.style.display = 'none';
    showSidebarBtn.style.display = 'flex';
    hideSidebarBtn.style.display = 'none'; 
    localStorage.setItem('showSideBar', 'false');
  }
}
// 15
function toggleTheme() {
  const currentTheme = document.body.classList.contains('light-theme') ? 'light-theme' : 'dark-theme';
  const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';

  document.body.classList.remove(currentTheme);
  document.body.classList.add(newTheme);

  localStorage.setItem('theme', newTheme);
}
// 16
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light-theme' || savedTheme === 'dark-theme') {
    document.body.classList.add(savedTheme);
  } else {
    document.body.classList.add('light-theme');
  }
}
// 17
function initializeSidebar() {
  const showSideBar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSideBar);
}
// 18
function openEditTaskModal(task) {
  selectedTaskId = task.id;
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;
  toggleModal(true, elements.editTaskModal);
  elements.filterDiv.style.display = 'block';
}
// 19
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
function deleteTask() {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.id !== selectedTaskId);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  refreshTasksUI();
  toggleModal(false, elements.editTaskModal);
  elements.filterDiv.style.display = 'none';
}
// 20
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
document.addEventListener('DOMContentLoaded', function() {
  initializeData();
  applySavedTheme();
  setupEventListeners();
  initializeSidebar();
  fetchAndDisplayBoardsAndTasks();
});
function createNewTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  return task;
}
function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  const taskTitle = document.createElement('h4');
  taskTitle.textContent = task.title;
  taskTitle.classList.add('task-title');

  taskElement.appendChild(taskTitle);
  return taskElement;
}
// Save tasks to localStorage
function saveTasksToLocalStorage() {
  const tasks = getTasks();
  localStorage.setItem('tasks', JSON.stringify(tasks));
}