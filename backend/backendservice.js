const express = require("express");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const path = require("path"); // Import the path module

const app = express();
const PORT = process.env.PORT || 5000;

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/inventory", (req, res) => {
  fs.readFile("inventoryList.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      res
        .status(500)
        .json({ error: "Error reading file", details: err.message });
      return;
    }
    try {
      const inventoryData = JSON.parse(data);
      res.json(inventoryData);
    } catch (parseErr) {
      console.error("Error parsing data:", parseErr);
      res
        .status(500)
        .json({ error: "Error parsing data", details: parseErr.message });
    }
  });
});

app.post("/api/updateInventory", (req, res) => {
  const updatedInventory = req.body;
  fs.writeFile(
    "inventoryList.json",
    JSON.stringify(updatedInventory, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        res
          .status(500)
          .json({ error: "Error writing to file", details: err.message });
        return;
      }
      console.log("Inventory updated successfully");
      res.status(200).json({ message: "Inventory updated successfully" });
    }
  );
});

app.delete("/api/deleteItem/:id", (req, res) => {
  const itemId = req.params.id;
  fs.readFile("inventoryList.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res
        .status(500)
        .json({ error: "Error reading file", details: err.message });
    }
    try {
      let inventoryData = JSON.parse(data);
      inventoryData = inventoryData.filter((item) => item.id !== itemId);
      fs.writeFile(
        "inventoryList.json",
        JSON.stringify(inventoryData, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing to file:", writeErr);
            return res.status(500).json({
              error: "Error writing to file",
              details: writeErr.message,
            });
          }
          console.log("Item deleted successfully");
          res.status(200).json({ message: "Item deleted successfully" });
        }
      );
    } catch (parseErr) {
      console.error("Error parsing data:", parseErr);
      res
        .status(500)
        .json({ error: "Error parsing data", details: parseErr.message });
    }
  });
});

app.post("/api/addNewItem", (req, res) => {
  const newItem = req.body;
  fs.readFile("inventoryList.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res
        .status(500)
        .json({ error: "Error reading file", details: err.message });
    }
    try {
      const inventoryData = JSON.parse(data);
      inventoryData.push(newItem);
      fs.writeFile(
        "inventoryList.json",
        JSON.stringify(inventoryData, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing to file:", writeErr);
            return res.status(500).json({
              error: "Error writing to file",
              details: writeErr.message,
            });
          }
          console.log("New item added successfully");
          res.status(200).json({ message: "New item added successfully" });
        }
      );
    } catch (parseErr) {
      console.error("Error parsing data:", parseErr);
      res
        .status(500)
        .json({ error: "Error parsing data", details: parseErr.message });
    }
  });
});

app.post("/api/uploadImage", upload.single("inventoryImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const itemId = req.body.itemId;
  const filePath = req.file.path;

  const inventoryData = JSON.parse(
    fs.readFileSync("inventoryList.json", "utf8")
  );
  const itemIndex = inventoryData.findIndex((item) => item.id === itemId);
  if (itemIndex !== -1) {
    inventoryData[itemIndex].imagePath = filePath;
    fs.writeFileSync(
      "inventoryList.json",
      JSON.stringify(inventoryData, null, 2)
    );
    res
      .status(200)
      .json({ message: "Image uploaded successfully", filePath: filePath });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
