const { query } = require("../config/prisma");
const {
  createtaskTableQuery,
  creatRoleQuery,
  CreatetasksQuery,
  deletetasksQuery,
  getAlltasksQuery,
  updatetasksQuery,
  gettasksQuery
} = require("../config/sqlQuery");

const getAlltasks = async (req, res) => {
  try {
    await query(creatRoleQuery);
    await query(createtaskTableQuery);

    const { rows } = await query(getAlltasksQuery);
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

const gettasks = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await query(gettasksQuery, [id]);

    if (!data.rows.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(data.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletetasks = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await query(deletetasksQuery, [id]);

    if (!data.rowCount) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Updatetasks = async (req, res) => {
  try {
    const id = req.params.id;
    const { project_id, title, description, priority, status, deadline } = req.body;

    const result = await query(updatetasksQuery, [
      project_id,
      title,
      description,
      priority,
      status,
      deadline,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not updated" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Createtasks = async (req, res) => {
  try {
    const { project_id, title, description, priority, status, deadline } = req.body;

    if (!project_id || !title || !description || !deadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const data = await query(CreatetasksQuery, [
      project_id,
      title,
      description,
      priority || "medium",
      status || "todo",
      deadline
    ]);

    res.status(201).json(data.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAlltasks,
  gettasks,
  deletetasks,
  Updatetasks,
  Createtasks
};