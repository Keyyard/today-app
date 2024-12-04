"use client";

import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import { addTask, getTasks, doneTask, reAddTask } from "@/services/taskService";
import { Task, TaskStatus } from "@/app/components/task";
import { toast } from "react-hot-toast";
import { signIn, signOut, useSession } from "next-auth/react";

const ThemeSwitcher = lazy(() => import("@/app/components/themeSwticher"));
const Toaster = lazy(() =>
  import("react-hot-toast").then((mod) => ({ default: mod.Toaster }))
);

export default function App() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [time, setTime] = useState<string>("");
  const [newTask, setNewTask] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    }, 60000);

    setTime(
      new Date().toLocaleTimeString([], {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cachedTasks = window.localStorage.getItem("tasks");
    if (cachedTasks) {
      setTasks(JSON.parse(cachedTasks));
    } else {
      fetchTasks();
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.tasks);
    } catch {
      console.log("Error fetching tasks");
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() === "") return;
    const newTaskData = {
      id: Date.now(),
      task: newTask,
      status: TaskStatus.Active,
      date: new Date(),
    };
    setTasks((prev) => [newTaskData, ...prev]); // Update UI immediately
    setNewTask("");
    try {
      // @ts-expect-error - this works lol don't change if it's working
      await addTask(newTask);
    } catch (error) {
      setTasks((prev) => prev.filter((task) => task.id !== newTaskData.id)); // rollback UI changes
      toast.error("Error adding task");
      console.log("Error adding task");
    }
  };

  const handleDoneTask = async (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: TaskStatus.Done } : task
      )
    );
    try {
      await doneTask(id);
    } catch (error) {
      toast.error("Error marking task as done");
    }
  };

  const handleReAddTask = async (task: Task) => {
    const updatedTask = { ...task, date: new Date(), status: TaskStatus.Active };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updatedTask : t))
    ); // Update UI immediately
    try {
      await reAddTask(task);
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      ); // Rollback UI changes
      toast.error("Error re-adding task");
      console.error("Error re-adding task", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask(e.target.value);
  };

  const handleInputBlur = () => {
    handleAddTask();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const toggleInput = () => {
    setShowInput(!showInput);
    if (!showInput && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<div>Loading...</div>}>
        <ThemeSwitcher />
        <Toaster position="top-right" reverseOrder={true} />
      </Suspense>
      <div className="justify-center">
        <h1 className="header">Today</h1>
        <h2 className="timestamp">{time}</h2>
      </div>
      {!session ? (
        <div>
          <button onClick={() => signIn("google")} className="sign-in">
            Sign in with Google
          </button>
          <div className="flex justify-center items-center">
            Please sign in to view tasks
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => signOut()} className="sign-out">
            Sign out
          </button>
          <div className="task-list">
            {showInput && (
              <input
                ref={inputRef}
                type="text"
                value={newTask}
                onFocus={handleInputFocus}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                placeholder="Type a new task.."
                className="task-input"
              />
            )}
            {tasks
              .filter((task) => task.status === TaskStatus.Active)
              .map((task, index) => (
                <div
                  key={index}
                  className="active-task task"
                  onClick={() => handleDoneTask(task.id)}
                >
                  {task.task}
                </div>
              ))}
            {tasks
              .filter((task) => task.status === TaskStatus.Expired)
              .map((task, index) => (
                <div
                  key={index}
                  className="expired-task task"
                  onClick={() => handleDoneTask(task.id)}
                >
                  {task.task}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}