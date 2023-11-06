const { createWorker } = require("tesseract.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // console.log(req.file.path);
    if (!req.file) {
      return res.json({ result: "No file uploaded" });
    }
    const worker = await createWorker("eng");
    const { path } = req.file;
    const {
      data: { text },
    } = await worker.recognize(path);
    await worker.terminate();
    return res.json({ result: text });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
