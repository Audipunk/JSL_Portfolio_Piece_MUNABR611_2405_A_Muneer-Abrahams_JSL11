// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask } from "./utils/taskFunctions.js"; //added helper functions from utilities
// TASK: import initialData
import { initialData } from "./initialData.js";//added import initial data to populate local storage if empty

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}


// TASK: Get elements from DOM. 
const elements = { //element object contains refrences to various DOM elements (buttons/headers/modal window etc.)
  themeSwitch: document.getElementById('switch'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  headerBoardName: document.getElementById('header-board-name'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  deleteBoardBtn: document.getElementById('delete-board-btn'),
  columnDivs: document.querySelectorAll('.column-div'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  modalWindow: document.getElementById('new-task-modal-window'),
  filterDiv: document.getElementById('filterDiv')
  
}

let activeBoard = ""//variable keeps track of currently selected board via user

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; // added : instead of ; to coreect ternary operator
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { //corrected event listener syntax
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);// changed to === for strict syntax

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

 //alligned columns

    const tasksContainer = document.createElement("div");
    tasksContainer.className = 'tasks-container'; // added the classname property to class container
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { //added evenetlistener for user click
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  };



function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { // changed 'foreach' to 'forEach', correcting syntax.
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
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
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));//added event listener, error was click function instead of event listener

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
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));//added event listener to not click function
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));//added event listener. error was clicking function

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; // error =>; changed to : for ternary operator
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {//handles addition of a new task added
  event.preventDefault(); //stops default submission behaviour

  //Assign user input to the task object
    const task = {// created task object with input values for user input
      title: document.getElementById('title-input').value,
      description: document.getElementById('desc-input').value,
      status: document.getElementById('select-status').value,
      board: activeBoard,
      id: new Date().getTime() 
    };
    
    const newTask = createNewTask(task); //createNewTask to process the task
    if (newTask) {
      addTaskToUI(newTask);//adds to UI if successful
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


//show or hide sidebar based on user interaction
function toggleSidebar(show) {
  //const fetches sidebar and button elements using ID
  const sideBar = document.getElementById('side-bar-div');
  const showSideBarBtn = document.getElementById('show-side-bar-btn');
  //use 'show' parameter to determine sidebar visibility based on toggle
  if (show) {
    sideBar.style.display = 'block'; //when true show sidebar
    showSideBarBtn.style.display = 'none';//hide the button
  }else {//if not true does the opposite
    // when it is false hide the button
    sideBar.style.display = 'none';
    // otherwise display the button
    showSideBarBtn.style.display = 'block';
  }
  localStorage.setItem('showSideBar', show)//saves sidebar visibility state in local strge when used across sessions
}
//toggles between light/dark themes
function toggleTheme() {
  // const used to toggle light-theme 'class' on the body element
  const isLightTheme = document.body.classList.toggle('light-theme');
  // saves the current state of theme in the local storage to remember user input
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
  //ternary operator; if the 'light-theme' class is on, allow save 'enabled', otherwise 'disabled'
}


///function prepares modal for editing existing task
function openEditTaskModal(task) {
  // populate modal inputs field with current user details of the task
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

  // Get button elements from the task modal.Btn event handlers to set for 'save change/dlte task' btns
  const saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveTaskChangesBtn.onclick = () => saveTaskChanges(task.id);//calls element to save

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = () => {
    // confirms before deleting the task , using confirmation prompt
    const confirmation = confirm("You want to delete this task?");
    if (confirmation) {
      // Deletes task with the specific id
      deleteTask(task.id);
      // Closes the edit task modal
      toggleModal(false, elements.editTaskModal);
      // Hides the filterDiv element
      elements.filterDiv.style.display = 'none';
      // Refresh the tasks on userinterface to show the changes made
      refreshTasksUI();
    }
  };
  //finaly displays and Show the edit task modal
  toggleModal(true, elements.editTaskModal); 
}

//function to save changes made to existing task
function saveTaskChanges(taskId) {
  // Get new user inputs using getelement by Id method
  const taskDetails = {
    title: document.getElementById('edit-task-title-input').value,
    description: document.getElementById('edit-task-desc-input').value,
    status: document.getElementById('edit-select-status').value,
    board: activeBoard,
    id: taskId
  } 

  // Create an object with the updated task details
  const updatedTask = {// prepares object with updated details
    title: taskDetails.title,
    description: taskDetails.description,
    status: taskDetails.status,
    board: taskDetails.board,
    id: taskDetails.id
  };

  // Calls helper function to update task in the data source
  patchTask(taskId, updatedTask)

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  elements.filterDiv.style.display = 'none'
  refreshTasksUI();
}





/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}