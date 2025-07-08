import React, { useState, useEffect } from "react";
import { Edit, Trash2, Filter, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import API_BASE from "@/api/axios";

// Custom table components using Tailwind
const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
);

const TableBody = ({ children }) => (
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
    {children}
  </tbody>
);

const TableRow = ({ children }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">{children}</tr>
);

const TableHead = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td
    className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </td>
);

const Datatable = () => {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [importanceFilter, setImportanceFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    status: "",
    importance: "",
    due: "",
  });

  // Create task states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    status: "Pending",
    importance: "Medium",
    due: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const statusOptions = ["All", "Pending", "In Progress", "Completed"];
  const importanceOptions = ["All", "High", "Medium", "Low"];

  // Fetch tasks for the logged-in user
  const fetchTasks = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    try {
      const response = await API_BASE.get(`/tasks?userId=${user.id}`);
      setTasks(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsCreating(true);
    try {
      const newTask = {
        ...createForm,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await API_BASE.post("/tasks", newTask);
      setTasks([...tasks, response.data]);
      setCreateForm({
        title: "",
        status: "Pending",
        importance: "Medium",
        due: "",
      });
      setIsCreateDialogOpen(false);
      setSuccess("Task created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "All" || task.status === statusFilter;
    const importanceMatch =
      importanceFilter === "All" || task.importance === importanceFilter;
    return statusMatch && importanceMatch;
  });

  const handleEdit = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      status: task.status,
      importance: task.importance,
      due: task.due,
    });
  };

  const handleSave = async (taskId) => {
    if (!editForm.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      const updatedTask = {
        ...editForm,
        updatedAt: new Date().toISOString(),
      };

      const response = await API_BASE.patch(`/tasks/${taskId}`, updatedTask);

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, ...response.data } : task
        )
      );

      setEditingTask(null);
      setEditForm({ title: "", status: "", importance: "", due: "" });
      setSuccess("Task updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    setEditForm({ title: "", status: "", importance: "", due: "" });
  };

  const handleDelete = async (taskId) => {
    try {
      await API_BASE.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
      setSuccess("Task deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "In Progress":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      case "Pending":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case "High":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      case "Medium":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
      case "Low":
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  // Fetch tasks when component mounts or user changes
  useEffect(() => {
    fetchTasks();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500">Please log in to view your tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Header with Create Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Tasks
        </h2>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your task list.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-1">
                  Task Title
                </Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status" className="mb-1">
                  Status
                </Label>
                <select
                  id="status"
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <Label htmlFor="importance" className="mb-1">
                  Importance
                </Label>
                <select
                  id="importance"
                  value={createForm.importance}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, importance: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <Label htmlFor="due" className="mb-1">
                  Due Date
                </Label>
                <Input
                  id="due"
                  type="date"
                  value={createForm.due}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, due: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Importance:
          </label>
          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {importanceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {(statusFilter !== "All" || importanceFilter !== "All") && (
          <button
            onClick={() => {
              setStatusFilter("All");
              setImportanceFilter("All");
            }}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center min-h-44">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading tasks...</span>
        </div>
      ) : /* Table */
      filteredTasks.length === 0 ? (
        <div className="flex items-center justify-center min-h-44 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-base text-gray-500 dark:text-gray-400">
            {tasks.length === 0
              ? "No tasks found. Create your first task!"
              : "No tasks match the selected filters"}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Importance</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  {editingTask === task.id ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    task.title
                  )}
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <select
                      value={editForm.importance}
                      onChange={(e) =>
                        setEditForm({ ...editForm, importance: e.target.value })
                      }
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getImportanceColor(
                        task.importance
                      )}`}
                    >
                      {task.importance}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <input
                      type="date"
                      value={editForm.due}
                      onChange={(e) =>
                        setEditForm({ ...editForm, due: e.target.value })
                      }
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    task.due || "No due date"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingTask === task.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(task.id)}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the task "{task.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(task.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Datatable;
