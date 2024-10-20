const express = require("express");
const cors = require("cors");

const studentsRoutes = require("./routes/studentsRoutes");

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors("http://localhost:3000"));

app.use("/api/students", studentsRoutes);

app.listen(PORT, () => console.info(`Server running on port ${PORT}`));
