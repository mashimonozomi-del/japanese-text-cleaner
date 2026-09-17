import express from "express";
import { paymentMiddleware } from "@x402/express";
import {
  x402ResourceServer,
  HTTPFacilitatorClient
} from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));

const payTo = process.env.PAY_TO || "0x4ffe239509AF666590278cb649E4e92f19E648a2";
const facilitatorUrl =
  process.env.FACILITATOR_URL || "https://x402.dexter.cash";

const facilitatorClient = new HTTPFacilitatorClient({
  url: facilitatorUrl
});

const server = new x402ResourceServer(facilitatorClient);
server.register("eip155:*", new ExactEvmScheme());

app.get("/", (req, res) => {
  res.json({
    name: "Japanese Text Cleaner",
    description: "Japanese text cleaning API for AI agents",
    status: "online",
    endpoint: "POST /clean",
    price: "$0.01 USDC",
    network: "Base (eip155:8453)"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(
  paymentMiddleware(
    {
      "POST /clean": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: "eip155:8453",
            payTo
          }
        ],
        description: "Clean and normalize Japanese text for AI agents",
        mimeType: "application/json"
      }
    },
    server
  )
);

function cleanJapaneseText(text) {
  return text
    .normalize("NFKC")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

app.post("/clean", (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      error: "Please provide Japanese text."
    });
  }

  res.json({
    original: text,
    cleaned: cleanJapaneseText(text)
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON body." });
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Japanese Text Cleaner running on port ${PORT}`);
});
