import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Dhara API up and running");
});

app.listen(5000, () => console.log("🚀 API running on http://localhost:5000"));
