const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = 3000;

const STUDENT_SERVICE_URL = "http://localhost:4001";
const COURSE_SERVICE_URL = "http://localhost:4002";
const STUDENT_QUERY_SERVICE_URL = "http://localhost:4003";

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", gateway: true, time: new Date().toISOString() });
});

app.get("/students", async (req, res) => {
  try {
    const response = await axios.get(`${STUDENT_QUERY_SERVICE_URL}/students`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Query service error" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const response = await axios.post(
      `${STUDENT_SERVICE_URL}/students`,
      req.body
    );

    let warning = null;
    try {
      await axios.post(`${STUDENT_QUERY_SERVICE_URL}/students/sync`, {
        name: response.data?.name,
      });
    } catch (syncError) {
      warning = "Read model sync failed (eventual consistency)";
    }

    res.status(201).json({
      student: response.data,
      warning,
    });
  } catch (error) {
    res.status(500).json({ message: "Command service error" });
  }
});

app.get("/courses", async (req, res) => {
  try {
    const response = await axios.get(`${COURSE_SERVICE_URL}/courses`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Course service error" });
  }
});

app.post("/courses", async (req, res) => {
  try {
    const response = await axios.post(
      `${COURSE_SERVICE_URL}/courses`,
      req.body
    );
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Course service error" });
  }
});

app.listen(PORT, () => {
  console.log(`api-gateway running on ${PORT}`);
});
