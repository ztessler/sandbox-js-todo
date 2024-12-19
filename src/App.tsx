import { Component, createSignal, For, createEffect } from "solid-js";
import styles from "./App.module.css";
import { injectSpeedInsights } from "@vercel/speed-insights";

injectSpeedInsights();

type TodoItem = {
  id: number;
  text: string;
  completed: boolean;
  timestamp: Date;
};

const STORAGE_KEY = "solid-todos";

const loadTodos = (): TodoItem[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    // Parse stored todos and convert timestamp strings back to Date objects
    return JSON.parse(stored).map((todo: any) => ({
      ...todo,
      timestamp: new Date(todo.timestamp),
    }));
  } catch (e) {
    console.error("Failed to load todos:", e);
    return [];
  }
};

const App: Component = () => {
  const [todos, setTodos] = createSignal<TodoItem[]>(loadTodos());
  const [newTodo, setNewTodo] = createSignal("");

  const addTodo = (e: Event) => {
    e.preventDefault();
    if (!newTodo().trim()) return;

    setTodos([
      ...todos(),
      {
        id: Date.now(),
        text: newTodo(),
        completed: false,
        timestamp: new Date(),
      },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos().map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Add effect to save todos when they change
  createEffect(() => {
    const currentTodos = todos();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTodos));
  });

  const sortedTodos = () => {
    return [...todos()].sort((a, b) => {
      // First sort by completed status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then sort by timestamp (newest first for each group)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

  const groupedTodos = () => {
    const sorted = sortedTodos();
    return {
      active: sorted.filter((todo) => !todo.completed),
      completed: sorted.filter((todo) => todo.completed),
    };
  };

  return (
    <div class={styles.App}>
      <h1>Todo App</h1>
      <form onSubmit={addTodo} class={styles.todoForm}>
        <input
          type="text"
          value={newTodo()}
          onInput={(e) => setNewTodo(e.currentTarget.value)}
          placeholder="What needs to be done?"
          class={styles.todoInput}
        />
        <button type="submit" class={styles.addButton}>
          Add Todo
        </button>
      </form>
      <div class={styles.todoLists}>
        <div class={styles.todoSection}>
          <h2>Active Tasks</h2>
          <ul class={styles.todoList}>
            <For each={groupedTodos().active}>
              {(todo) => (
                <li
                  class={`${styles.todoItem} ${
                    todo.completed ? styles.completed : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <div class={styles.todoContent}>
                    <span>{todo.text}</span>
                    <span class={styles.timestamp}>
                      {todo.timestamp.toLocaleString()}
                    </span>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>

        <div class={styles.todoSection}>
          <h2>Completed Tasks</h2>
          <ul class={styles.todoList}>
            <For each={groupedTodos().completed}>
              {(todo) => (
                <li
                  class={`${styles.todoItem} ${
                    todo.completed ? styles.completed : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <div class={styles.todoContent}>
                    <span>{todo.text}</span>
                    <span class={styles.timestamp}>
                      {todo.timestamp.toLocaleString()}
                    </span>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
