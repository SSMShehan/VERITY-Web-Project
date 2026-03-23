const fs = require("fs");
const path = require("path");
const { query } = require("../config/prisma");
const { sendMail } = require("../config/mailer");
const {
  createtaskTableQuery,
  normalizeTaskProjectIdTypeQuery,
  ensureTaskPdfColumnsQuery,
  creatRoleQuery,
  CreatetasksQuery,
  deletetasksQuery,
  getAlltasksQuery,
  updatetasksQuery,
  gettasksQuery
} = require("../config/sqlQuery");

const uploadsDir = path.resolve(__dirname, "../../uploads/task-pdfs");

const buildPdfUrl = (req, task) => {
  if (!task?.pdf_path) return null;
  return `${req.protocol}://${req.get("host")}/api/tasks/${task.id}/pdf`;
};

const withPdfUrl = (req, task) => ({
  ...task,
  pdf_url: buildPdfUrl(req, task)
});

const ensureUploadsDir = async () => {
  await fs.promises.mkdir(uploadsDir, { recursive: true });
};

const removeStoredPdf = async (pdfPath) => {
  if (!pdfPath) return;

  const normalizedPath = String(pdfPath).replace(/^\/+/, "");
  const absolutePath = path.resolve(__dirname, "../../", normalizedPath);

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const getStoredPdfAbsolutePath = (pdfPath) => {
  const normalizedPath = String(pdfPath || "").replace(/^\/+/, "");
  return path.resolve(__dirname, "../../", normalizedPath);
};

const getNotificationRecipients = async () => {
  const { rows } = await query('SELECT name, email FROM "User" WHERE email IS NOT NULL AND TRIM(email) <> \'\'');
  return rows;
};

const sendTaskCreatedEmail = async (req, task) => {
  const recipients = await getNotificationRecipients();

  if (!recipients.length) {
    return {
      sent: false,
      reason: "No user emails found",
      recipientCount: 0,
    };
  }

  const deadline = task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline";
  const pdfUrl = buildPdfUrl(req, task);
  const subject = `New assignment: ${task.title}`;
  const text = [
    "A new assignment has been uploaded.",
    "",
    `Project ID: ${task.project_id}`,
    `Title: ${task.title}`,
    `Description: ${task.description || "No description"}`,
    `Priority: ${task.priority || "medium"}`,
    `Status: ${task.status || "todo"}`,
    `Deadline: ${deadline}`,
    pdfUrl ? `PDF: ${pdfUrl}` : "PDF: Not attached",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">New Assignment Uploaded</h2>
      <p>A new assignment has been uploaded to Verity.</p>
      <p><strong>Project ID:</strong> ${task.project_id}</p>
      <p><strong>Title:</strong> ${task.title}</p>
      <p><strong>Description:</strong> ${task.description || "No description"}</p>
      <p><strong>Priority:</strong> ${task.priority || "medium"}</p>
      <p><strong>Status:</strong> ${task.status || "todo"}</p>
      <p><strong>Deadline:</strong> ${deadline}</p>
      <p><strong>PDF:</strong> ${pdfUrl ? `<a href="${pdfUrl}">${task.pdf_name || "Open PDF"}</a>` : "Not attached"}</p>
    </div>
  `;

  const result = await sendMail({
    to: recipients.map((recipient) => recipient.email).join(", "),
    subject,
    text,
    html,
  });

  return {
    ...result,
    recipientCount: recipients.length,
  };
};

const savePdfFromPayload = async (pdf) => {
  if (!pdf?.content) {
    return {
      pdfName: null,
      pdfPath: null,
      pdfMimeType: null
    };
  }

  const mimeType = String(pdf.mimeType || "application/pdf").trim().toLowerCase();
  const isPdf = mimeType === "application/pdf" || String(pdf.fileName || "").toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("Only PDF files are allowed");
  }

  const matches = String(pdf.content).match(/^data:application\/pdf;base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid PDF payload");
  }

  await ensureUploadsDir();

  const safeBaseName = String(pdf.fileName || "task-document.pdf")
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "task-document";
  const fileName = `${Date.now()}-${safeBaseName}.pdf`;
  const absolutePath = path.join(uploadsDir, fileName);
  const relativePath = `/uploads/task-pdfs/${fileName}`;

  await fs.promises.writeFile(absolutePath, Buffer.from(matches[1], "base64"));

  return {
    pdfName: String(pdf.fileName || fileName).trim(),
    pdfPath: relativePath,
    pdfMimeType: "application/pdf"
  };
};

const ensureTasksSchema = async () => {
  await query(creatRoleQuery);
  await query(createtaskTableQuery);
  await query(normalizeTaskProjectIdTypeQuery);
  await query(ensureTaskPdfColumnsQuery);
};

const getAlltasks = async (req, res) => {
  try {
    await ensureTasksSchema();

    const { rows } = await query(getAlltasksQuery);
    res.json(rows.map((task) => withPdfUrl(req, task)));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

const gettasks = async (req, res) => {
  try {
    await ensureTasksSchema();
    const id = req.params.id;
    const data = await query(gettasksQuery, [id]);

    if (!data.rows.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(withPdfUrl(req, data.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletetasks = async (req, res) => {
  try {
    await ensureTasksSchema();
    const id = req.params.id;
    const data = await query(deletetasksQuery, [id]);

    if (!data.rowCount) {
      return res.status(404).json({ error: "Task not found" });
    }

    await removeStoredPdf(data.rows[0]?.pdf_path);

    res.json({ message: "Task deleted successfully", task: data.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadTaskPdf = async (req, res) => {
  try {
    await ensureTasksSchema();
    const id = req.params.id;
    const data = await query(gettasksQuery, [id]);

    if (!data.rows.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = data.rows[0];
    if (!task.pdf_path) {
      return res.status(404).json({ error: "PDF not found for this task" });
    }

    const absolutePath = getStoredPdfAbsolutePath(task.pdf_path);

    await fs.promises.access(absolutePath, fs.constants.F_OK);
    return res.download(absolutePath, task.pdf_name || `${task.title || "task-document"}.pdf`);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "Stored PDF file not found" });
    }
    return res.status(500).json({ error: error.message });
  }
};

const Updatetasks = async (req, res) => {
  try {
    await ensureTasksSchema();
    const id = req.params.id;
    const { project_id, title, description, priority, status, deadline, pdf } = req.body;
    const normalizedProjectId =
      project_id === undefined || project_id === null ? null : String(project_id).trim();
    const pdfData = await savePdfFromPayload(pdf);

    const result = await query(updatetasksQuery, [
      normalizedProjectId,
      title,
      description,
      priority,
      status,
      deadline,
      pdfData.pdfName,
      pdfData.pdfPath,
      pdfData.pdfMimeType,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not updated" });
    }

    res.json(withPdfUrl(req, result.rows[0]));
  } catch (error) {
    const statusCode =
      error.message === "Only PDF files are allowed" || error.message === "Invalid PDF payload" ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const Createtasks = async (req, res) => {
  try {
    await ensureTasksSchema();
    const { project_id, title, description, priority, status, deadline, pdf } = req.body;
    const normalizedProjectId = String(project_id || "").trim();

    if (!normalizedProjectId || !title || !description || !deadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pdfData = await savePdfFromPayload(pdf);

    const data = await query(CreatetasksQuery, [
      normalizedProjectId,
      title,
      description,
      priority || "medium",
      status || "todo",
      deadline,
      pdfData.pdfName,
      pdfData.pdfPath,
      pdfData.pdfMimeType
    ]);

    const createdTask = withPdfUrl(req, data.rows[0]);
    const notification = await sendTaskCreatedEmail(req, createdTask);

    res.status(201).json({
      ...createdTask,
      notification,
    });
  } catch (error) {
    const statusCode =
      error.message === "Only PDF files are allowed" || error.message === "Invalid PDF payload" ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  getAlltasks,
  gettasks,
  downloadTaskPdf,
  deletetasks,
  Updatetasks,
  Createtasks
};
