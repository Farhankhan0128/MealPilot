import { createMealPilotServer } from "./app.js";
import { readConfig } from "./config.js";
import { createFileSessionStore } from "./store/sessionStore.js";

const config = readConfig();
const { app } = createMealPilotServer({
  config,
  store: config.dataFile ? createFileSessionStore(config.dataFile) : undefined,
  serveStatic: process.env.NODE_ENV === "production",
});

app.listen(config.port, () => {
  console.log(`MealPilot API listening on http://localhost:${config.port}`);
});
