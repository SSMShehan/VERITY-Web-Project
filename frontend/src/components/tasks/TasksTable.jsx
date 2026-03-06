import React from "react";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import TasksModel from "./TasksModel";

const TasksTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">No Tasks data available</p>
        <TasksModel>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create New Task
          </button>
        </TasksModel>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <TasksModel>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add New Task
          </button>
        </TasksModel>
      </div>
      <div className="min-w-[900px] bg-gray-100 rounded-xl p-6">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Project ID</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="text-sm text-gray-700 hover:bg-gray-200 transition"
              >
                <td className="py-3 px-4">{item.id}</td>
                <td className="py-3 px-4">{item.project_id}</td>
                <td className="py-3 px-4">{item.title}</td>
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(item.deadline).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-3">
                    <button className="p-2 rounded bg-red-100 hover:bg-red-200 transition">
                      <MdDelete className="text-red-600" />
                    </button>
                    <button className="p-2 rounded bg-green-100 hover:bg-green-200 transition">
                      <FaRegEdit className="text-green-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksTable;
