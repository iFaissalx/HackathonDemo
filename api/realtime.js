import { WebSocket } from "ws";

export default async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const model = "gpt-4o-realtime-preview";

    const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=${model}`,
        {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "realtime=v1"
            }
        }
    );

    ws.on("open", () => {
        console.log("Realtime connection established");
    });

    ws.on("message", (data) => {
        res.write(data);
    });

    ws.on("close", () => {
        res.end();
    });

    ws.on("error", (err) => {
        console.error("Realtime error", err);
        res.status(500).send("WebSocket error");
    });

    req.on("close", () => ws.close());
}
