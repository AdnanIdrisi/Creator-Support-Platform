import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

try {
    await connectDB();
    app.listen(env.PORT, () => {
        console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
    });
} catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
}
