const express = require("express");
const {
  getAlltasks,
  gettasks,
  downloadTaskPdf,
  deletetasks,
  Updatetasks,
  Createtasks
} = require("../controllers/tasksControllers");

const router = express.Router();

router.post("/", Createtasks);
router.get("/", getAlltasks);
router.get("/:id/pdf", downloadTaskPdf);
router.get("/:id", gettasks);
router.put("/:id", Updatetasks);
router.delete("/:id", deletetasks);

module.exports = router;
