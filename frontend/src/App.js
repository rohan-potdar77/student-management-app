import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./App.css";

const App = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [students, setStudents] = useState([]);

  const totalPages = Math.ceil(total / limit);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/students?page=${page}&limit=${limit}`
      );
      setStudents(response.data.students);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleDelete = async (studentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/api/students/${studentId}`);
        Swal.fire("Deleted!", "The student has been deleted.", "success");
        fetchStudents();
      } catch (error) {
        Swal.fire(
          "Error!",
          "An error occurred while deleting the student.",
          "error"
        );
        console.error("Error deleting student:", error);
      }
    }
  };

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add New Member",
      html: `
        <style>
          .swal2-input {
            width: 100%;
            max-width: 300px;
            margin: 0.5em 0;
          }
        </style>
        <input id="name" class="swal2-input" placeholder="Name">
        <input id="age" class="swal2-input" placeholder="Age" type="number">
        <input id="grade" class="swal2-input" placeholder="Grade">
        <input id="subject" class="swal2-input" placeholder="Subject">
        <input id="marks" class="swal2-input" placeholder="Marks">
      `,
      confirmButtonText: "Submit",
      focusConfirm: false,
      preConfirm: () => {
        const name = Swal.getPopup().querySelector("#name").value;
        const age = Swal.getPopup().querySelector("#age").value;
        const grade = Swal.getPopup().querySelector("#grade").value;
        const subject = Swal.getPopup().querySelector("#subject").value;
        const marks = Swal.getPopup().querySelector("#marks").value;
        if (!name || !age || !grade || !subject || !marks) {
          Swal.showValidationMessage("Please enter all fields");
        }
        return { name, age, grade, subject, marks };
      },
    });

    if (formValues) {
      try {
        await axios.post("http://localhost:4000/api/students", formValues);
        Swal.fire("Success!", "The student has been added.", "success");
        fetchStudents();
      } catch (error) {
        Swal.fire(
          "Error!",
          "An error occurred while adding the student.",
          "error"
        );
        console.error("Error adding student:", error);
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit]);

  return (
    <Fragment>
      <div className="main">
        <button
          type="button"
          className="btn btn-success mb-3"
          onClick={handleCreate}
        >
          Add New Member
        </button>

        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Student Id</th>
              <th>Student Name</th>
              <th>Student Age</th>
              <th>Student Grade</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="table-group-divider">
            {students.map((student) => (
              <Fragment key={student.id}>
                <tr>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.age}</td>
                  <td>{student.grade}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(student.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>

        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-end">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <a
                className="page-link"
                href="#"
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </a>
            </li>
            {[...Array(totalPages).keys()].map((number) => (
              <li
                key={number + 1}
                className={`page-item ${number + 1 === page ? "active" : ""}`}
              >
                <a
                  className="page-link"
                  href="#"
                  onClick={() => handlePageChange(number + 1)}
                >
                  {number + 1}
                </a>
              </li>
            ))}
            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <a
                className="page-link"
                href="#"
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </Fragment>
  );
};

export default App;
