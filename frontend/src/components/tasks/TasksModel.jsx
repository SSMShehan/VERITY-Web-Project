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
  { label: "Description", name: "description", type: "textarea" },
  { label: "Priority", name: "priority" },
  { label: "Deadline", name: "deadline", type: "date" },
];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read PDF file"));
    reader.readAsDataURL(file);
  });

const parseErrorResponse = async (res, fallbackMessage) => {
  const text = await res.text();

  try {
    const data = JSON.parse(text);
    return data?.error || data?.message || fallbackMessage;
  } catch {
    return text || fallbackMessage;
  }
};

const TasksModel = ({ children, type = "add", data = null, initialData = null }) => {
  const getInitialInfo = () =>
    type === "add" ? { ...emptyTask, ...(initialData || {}) } : { ...emptyTask, ...data };

  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(getInitialInfo);
  const [selectedPdf, setSelectedPdf] = useState(null);

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

      if (!res.ok) {
        const message = await parseErrorResponse(res, "Failed to create task");
        if (res.status === 413 || /request entity too large/i.test(message)) {
          throw new Error("Upload is larger than the backend limit. Restart the backend server so the new 50 MB limit is applied.");
        }
        throw new Error(message);
      }

      const result = await res.json();
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

      if (!res.ok) {
        const message = await parseErrorResponse(res, "Failed to update task");
        if (res.status === 413 || /request entity too large/i.test(message)) {
          throw new Error("Upload is larger than the backend limit. Restart the backend server so the new 50 MB limit is applied.");
        }
        throw new Error(message);
      }

      const result = await res.json();
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setSelectedPdf(null);
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("Please select a PDF file.");
      e.target.value = "";
      return;
    }

    setSelectedPdf(file);
  };

  const handleFormSubmission = async () => {
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

    let payload = normalizedInfo;

    if (selectedPdf) {
      const dataUrl = await readFileAsDataUrl(selectedPdf);
      payload = {
        ...normalizedInfo,
        pdf: {
          fileName: selectedPdf.name,
          mimeType: selectedPdf.type || "application/pdf",
          content: dataUrl,
        },
      };
    }

    if (type === "add") {
      addMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  };

  const openModal = () => {
    setInfo(getInitialInfo());
    setSelectedPdf(null);
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
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={info[field.name] || ""}
                      onChange={handleChanges}
                      rows={4}
                      className="w-full resize-none rounded-xl bg-gray-100 px-4 py-3 shadow-inner outline-none focus:ring-blue-400"
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={info[field.name] || ""}
                      onChange={handleChanges}
                      className="w-full px-4 py-2 rounded-xl bg-gray-100 shadow-inner outline-none focus:ring-blue-400"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-600 mb-1">PDF</label>
                <label className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-gray-100 px-4 py-3 shadow-inner outline-none">
                  <span className="truncate text-sm text-gray-600">
                    {selectedPdf ? selectedPdf.name : "Choose a PDF file"}
                  </span>
                  <span className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-semibold text-white">Browse</span>
                  <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedPdf ? `${Math.round(selectedPdf.size / 102.4) / 10} KB selected` : "PDF only"}
                </p>
              </div>
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
