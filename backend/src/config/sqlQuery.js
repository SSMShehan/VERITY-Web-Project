const creatRoleQuery = `
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
      CREATE TYPE role_type AS ENUM ('Developer', 'Manager', 'Sales', 'Admin', 'Intern');
   END IF;
END$$;
`;

const createtaskTableQuery = `
CREATE TABLE IF NOT EXISTS tasks_details (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'todo',
  deadline TIMESTAMP,
  pdf_name TEXT,
  pdf_path TEXT,
  pdf_mime_type TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

const normalizeTaskProjectIdTypeQuery = `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tasks_details'
      AND column_name = 'project_id'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE tasks_details
    ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
  END IF;
END$$;
`;

const ensureTaskPdfColumnsQuery = `
ALTER TABLE tasks_details
ADD COLUMN IF NOT EXISTS pdf_name TEXT,
ADD COLUMN IF NOT EXISTS pdf_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_mime_type TEXT;
`;

const getAlltasksQuery = `
SELECT * FROM tasks_details;
`;

const CreatetasksQuery = `
INSERT INTO tasks_details (
  project_id,
  title,
  description,
  priority,
  status,
  deadline,
  pdf_name,
  pdf_path,
  pdf_mime_type
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;
`;

const gettasksQuery = `
SELECT * FROM tasks_details
WHERE id = $1;
`;

const deletetasksQuery = `
DELETE FROM tasks_details
WHERE id = $1;
RETURNING *;
`;

const updatetasksQuery = `
UPDATE tasks_details
SET
  project_id = COALESCE($1, project_id),
  title = COALESCE($2, title),
  description = COALESCE($3, description),
  priority = COALESCE($4, priority),
  status = COALESCE($5, status),
  deadline = COALESCE($6, deadline),
  pdf_name = COALESCE($7, pdf_name),
  pdf_path = COALESCE($8, pdf_path),
  pdf_mime_type = COALESCE($9, pdf_mime_type)
WHERE id = $10
RETURNING *;
`;

module.exports = {
  creatRoleQuery,
  createtaskTableQuery,
  normalizeTaskProjectIdTypeQuery,
  ensureTaskPdfColumnsQuery,
  getAlltasksQuery,
  CreatetasksQuery,
  gettasksQuery,
  deletetasksQuery,
  updatetasksQuery
};
