import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import Login from './pages/Login';
import Register from './pages/Register';
import TasksTable from './components/tasks/TasksTable';
import TasksModel from './components/tasks/TasksModel';

export const backendUrl = 'http://localhost:5000/api/tasks';

function App() {
  async function fetchTasksDetails() {
    const res = await fetch(backendUrl);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    return data;
  }

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["tasks_details"],
    queryFn: fetchTasksDetails,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen text-red-500">
      Error: {(error as Error).message}
    </div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/tasks" element={<TasksTable data={data} />} />
          <Route
            path="/tasks/model"
            element={
              <TasksModel>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Create Task
                </button>
              </TasksModel>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
