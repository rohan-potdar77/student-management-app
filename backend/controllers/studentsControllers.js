const pool = require("../databaseConfiguration");

const createStudent = async (req, res, _next) => {
  const { name, age, grade, subject, marks } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      "INSERT INTO students (name, age, grade) VALUES ($1, $2, $3) RETURNING id",
      [name, age, grade]
    );

    const studentId = result.rows[0].id;

    await client.query(
      "INSERT INTO marks (student_id, subject, marks) VALUES ($1, $2, $3)",
      [studentId, subject, marks]
    );

    await client.query("COMMIT");

    res.status(200).json({ student: result.rows[0], subject, marks });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

const getStudentById = async (req, res, _next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.age, s.grade, m.subject, m.marks 
       FROM students s 
       LEFT JOIN marks m ON s.id = m.student_id 
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentData = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      age: result.rows[0].age,
      grade: result.rows[0].grade,
      marks: result.rows.map((row) => ({
        subject: row.subject,
        marks: row.marks,
      })),
    };

    res.status(200).json(studentData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteStudentById = async (req, res, _next) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM marks WHERE student_id = $1", [id]);

    const result = await client.query(
      "DELETE FROM students WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Student not found" });
    }

    await client.query("COMMIT");
    res.status(200).json({
      message: "Student deleted successfully",
      student: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

const updateStudentById = async (req, res, _next) => {
  const { id } = req.params;
  const { name, age, grade, subject, marks } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const studentResult = await client.query(
      `UPDATE students
       SET name = $1, age = $2, grade = $3
       WHERE id = $4
       RETURNING *`,
      [name, age, grade, id]
    );

    if (studentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Student not found" });
    }

    const marksResult = await client.query(
      `UPDATE marks
       SET subject = $1, marks = $2
       WHERE student_id = $3
       RETURNING *`,
      [subject, marks, id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Student and marks updated successfully",
      student: studentResult.rows[0],
      marks: marksResult.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

const getStudents = async (req, res, _next) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const totalCountResult = await pool.query("SELECT COUNT(*) FROM students");
    const totalCount = parseInt(totalCountResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      total: totalCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      students: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getStudents,
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
};
