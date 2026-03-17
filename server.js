const express = require("express");
const { join } = require("path");
const app = express();

app.use(express.static(join(__dirname, "public")));

app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.listen(3000, () => console.log("Application running on port 3000"));