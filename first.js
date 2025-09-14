const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/students", (req, res) => {
    res.json([{ id: 1, name: "Test Student" }]);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
