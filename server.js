import express from "express";
import { paymentMiddleware } from "@x402/express";
import {
  x402ResourceServer,
  HTTPFacilitatorClient
} from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const app = express();
app.use(express.json());

const payTo = "0x4ffe239509AF666590278cb649E4e92f19E648a2";

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"
});

const server = new x402ResourceServer(facilitatorClient);
server.register("eip155:*", new ExactEvmScheme());

app.get("/", (req, res) => {
  res.json({
    name: "Japanese Text Cleaner",
    description: "Japanese text cleaning API for AI agents",
    status: "online",
    endpoint: "POST /clean",
    price: "$0.01 USDC"
  });
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Japanese Text Cleaner running on port ${PORT}`);
});
