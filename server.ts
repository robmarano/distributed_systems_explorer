import express from "express";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes for running Python simulations
  app.get("/api/run-simulation/:type", (req, res) => {
    const type = req.params.type;
    let scriptName = "";

    switch (type) {
      case "ipc":
        scriptName = "1_ipc_pipes.py";
        break;
      case "threads":
        scriptName = "2_threads_queues.py";
        break;
      case "sockets":
        scriptName = "3_tcp_sockets.py";
        break;
      default:
        res.status(400).send("Invalid simulation type");
        return;
    }

    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const scriptPath = path.join(__dirname, "python", scriptName);
    console.log(`Spawning python script: ${scriptPath}`);

    const pythonProcess = spawn("python3", [scriptPath]);

    pythonProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ type: "stdout", message: line })}\n\n`);
        }
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ type: "stderr", message: line })}\n\n`);
        }
      }
    });

    pythonProcess.on("close", (code) => {
      res.write(`data: ${JSON.stringify({ type: "exit", code })}\n\n`);
      res.end();
    });

    // Handle client disconnect
    req.on("close", () => {
      pythonProcess.kill();
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving (if needed later)
    app.use(express.static(path.resolve(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
