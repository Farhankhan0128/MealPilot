import { createMealPilotServer } from "./app.js";
import { readConfig } from "./config.js";

const config = readConfig();
const { app } = createMealPilotServer({
  config,
  serveStatic: process.env.NODE_ENV === "production",
});

app.listen(config.port, () => {
  console.log(`MealPilot API listening on http://localhost:${config.port}`);
});
