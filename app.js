const STORAGE_KEY = "daymark-todos";

const addForm = document.querySelector("#add-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const saveStatus = document.querySelector("#save-status");

let todos = loadTodos();

function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  saveStatus.textContent = "Saved locally";
}

function createTodo(text) {
  return {
    id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
  };
}

function renderTodos() {
  todoList.replaceChildren();
  emptyState.hidden = todos.length > 0;

  const remainingCount = todos.filter((todo) => !todo.completed).length;
  taskCount.textContent = `${remainingCount} ${remainingCount === 1 ? "task" : "tasks"}`;
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;
    item.dataset.id = todo.id;

    const checkButton = document.createElement("button");
    checkButton.className = "check-button";
    checkButton.type = "button";
    checkButton.setAttribute("aria-label", todo.completed ? `Mark ${todo.text} as incomplete` : `Complete ${todo.text}`);
    checkButton.textContent = "✓";
    checkButton.addEventListener("click", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const editButton = createActionButton("Edit", "✎", () => startEditing(item, todo));
    const deleteButton = createActionButton("Delete", "×", () => deleteTodo(todo.id));
    deleteButton.classList.add("delete");
    actions.append(editButton, deleteButton);

    item.append(checkButton, text, actions);
    todoList.append(item);
  });
}

function createActionButton(label, icon, onClick) {
  const button = document.createElement("button");
  button.className = "action-button";
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.textContent = icon;
  button.addEventListener("click", onClick);
  return button;
}

function addTodo(event) {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  todos.unshift(createTodo(text));
  saveTodos();
  renderTodos();
  addForm.reset();
  todoInput.focus();
}

function toggleTodo(id) {
  todos = todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function startEditing(item, todo) {
  const textElement = item.querySelector(".todo-text");
  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.type = "text";
  editInput.maxLength = 120;
  editInput.value = todo.text;
  editInput.setAttribute("aria-label", "Edit task");
  textElement.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  const finishEditing = () => {
    const text = editInput.value.trim();
    if (text) {
      todos = todos.map((currentTodo) => currentTodo.id === todo.id ? { ...currentTodo, text } : currentTodo);
      saveTodos();
    }
    renderTodos();
  };

  editInput.addEventListener("blur", finishEditing, { once: true });
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") editInput.blur();
    if (event.key === "Escape") {
      editInput.value = todo.text;
      editInput.blur();
    }
  });
}

addForm.addEventListener("submit", addTodo);
clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

renderTodos();
