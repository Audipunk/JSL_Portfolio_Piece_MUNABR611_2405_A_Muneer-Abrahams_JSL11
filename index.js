//  ASK: import helper functions from utils
import { createNewTask, getTasks, deleteTask, patchTask, putTask } from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSidebar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData();

// Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),// header

  // layout elements
  filterDiv: document.getElementById('filterDiv'),
  columnDivs: document.querySelectorAll('.column-div'),

  // modals
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),

  // controls
  themeSwitch: document.getElementById('switch'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
}

let activeBoard = ""

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];

  displayBoards(boards);

  // gets the current active board if not then selects firs in boards list
  if (boards.length > 0) {
    activeBoard = localStorage.getItem("activeBoard") || boards[0];
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)

    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container


  boards.forEach(board => {

    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", activeBoard);
      styleActiveBoard(activeBoard);
    });

    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a moda
      taskElement.addEventListener("click", () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active')
    }
    else {
      btn.classList.remove('active');
    }
  });
}


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

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild(taskElement);
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listenerjs
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event)
  });
};

// Toggles tasks modal
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
    board: activeBoard
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sidbarTag = document.getElementById("side-bar-div");
  const showSidebarBtn = elements.showSideBarBtn;

  if (show) {
    sidbarTag.style.display = 'block';
    showSidebarBtn.style.display = 'none';
    localStorage.setItem("showSidebar", 'true');
  } else {
    sidbarTag.style.display = 'none';
    showSidebarBtn.style.display = 'block';
    localStorage.setItem('showSidebar', 'false');
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("light-theme");
  const themeSwitch = elements.themeSwitch;
  const body = document.body;

  if (currentTheme == 'enabled') {
    themeSwitch.checked = false;
    body.classList.remove("light-theme");
    localStorage.setItem("light-theme", 'disabled');
  } else {
    themeSwitch.checked = true;
    body.classList.add("light-theme");
    localStorage.setItem('light-theme', 'enabled');
  }
}


function openEditTaskModal(task) {
  // Set task details in modal inputs

  document.getElementById("edit-task-title-input").value = task.title;
  document.getElementById("edit-task-desc-input").value = task.description;
  document.getElementById("edit-select-status").value = task.status;

  // Get button elements from the task modal
  const delBtn = document.getElementById("delete-task-changes-btn")

  // Call saveTaskChanges upon click of Save Changes button
  document.getElementById("save-task-changes-btn").addEventListener("click", event => {
    saveTaskChanges(task.id);

  });

  // Delete task using a helper function and close the task modal
  document.getElementById("delete-task-btn").addEventListener("click", event => {

    deleteTask(task.id)

    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  })


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {

  // Create an object with the updated task details
  const newTask = {
    title: document.getElementById("edit-task-title-input").value,
    description: document.getElementById("edit-task-desc-input").value,
    status: document.getElementById("edit-select-status").value,
  }

  // Update task using a helper function
  patchTask(taskId, newTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSidebar') === 'true';
  toggleSidebar(showSidebar);

  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  isLightTheme === 'enabled' ? elements.themeSwitch.checked = true : elements.themeSwitch.checked = false;

  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}