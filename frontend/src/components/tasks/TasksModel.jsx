import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { backendUrl } from "../../App";
import { queryClient } from "./queryClient";

const emptyTask = {
  project_id: "",
  title: "",
  description: "",
  priority: "",
  status: "",
  deadline: "",
};

const fields = [
  { label: "Project ID", name: "project_id" },
  { label: "Title", name: "title" },
  { label: "Description", name: "description" },
  { label: "Priority", name: "priority" },
  { label: "Status", name: "status" },
  { label: "Deadline", name: "deadline", type: "date" },
];

const TasksModel = ({ children, type = "add", data = null, initialData = null }) => {
  const getInitialInfo = () =>
    type === "add" ? { ...emptyTask, ...(initialData || {}) } : { ...emptyTask, ...data };

  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(getInitialInfo);

  const handleChanges = (e) => {
    setInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to create task");
      return result;
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks_details"] });
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${backendUrl}/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to update task");
      return result;
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks_details"] });
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleFormSubmission = () => {
    const required = ["project_id", "title", "description"];

    for (const field of required) {
      if (!String(info[field] || "").trim()) {
        alert("Please fill all required fields.");
        return;
      }
    }

    const normalizedInfo = {
      ...info,
      priority: String(info.priority || "medium").trim(),
      status: String(info.status || "in-progress").trim(),
      deadline: String(info.deadline || new Date().toISOString().slice(0, 10)).trim(),
    };

    if (type === "add") {
      addMutation.mutate(normalizedInfo);
    } else {
      updateMutation.mutate(normalizedInfo);
    }
  };

  const openModal = () => {
    setInfo(getInitialInfo());
    setOpen(true);
  };

  return (
    <div className="inline-block">
      <div onClick={openModal}>
        {children || <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Open Task Form</button>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40"></div>
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-gray-100 p-6 shadow-[10px_10px_25px_#c5c5c5,-10px_-10px_-25px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-700">{type === "add" ? "Add Task" : "Update Task"}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                x
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={info[field.name] || ""}
                    onChange={handleChanges}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 shadow-inner outline-none focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 shadow-[3px_3px_6px_#c5c5c5,-3px_-3px_6px_#fff] hover:shadow-inner">
                Cancel
              </button>
              <button
                onClick={handleFormSubmission}
                className="px-6 py-2 rounded-xl bg-blue-500 text-white shadow-lg transition hover:bg-blue-600"
              >
                {type === "add" ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksModel;
