const concurrently = require("concurrently");

concurrently([
  { name: "SERVER", command: "cd server && pnpm dev" },
  { name: "CLIENT", command: "cd client && pnpm dev" },
]);
