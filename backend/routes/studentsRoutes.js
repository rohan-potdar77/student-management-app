const express = require("express");
const router = express.Router();
const studentsControllers = require("../controllers/studentsControllers");

router.post("/", studentsControllers.createStudent);

router.get("/", studentsControllers.getStudents);

router.get("/:id", studentsControllers.getStudentById);

router.delete("/:id", studentsControllers.deleteStudentById);

router.put("/:id", studentsControllers.updateStudentById);

module.exports = router;
