import express from "express";

const app = express();
app.use(express.json());

function cleanJapaneseText(text) {
  return text
    .normalize("NFKC")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

app.get("/", (req, res) => {
  res.json({
    name: "Japanese Text Cleaner",
    description: "Japanese text cleaning API for AI agents",
    status: "online"
  });
});

app.post("/clean", (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      error: "Please provide Japanese text."
    });
  }

  const cleaned = cleanJapaneseText(text);

  res.json({
    original: text,
    cleaned: cleaned
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Japanese Text Cleaner running on port ${PORT}`);
});
