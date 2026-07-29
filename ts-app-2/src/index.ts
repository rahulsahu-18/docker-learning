import express from "express";
import { Client } from "pg";
import { createClient } from "redis";

const app = express();
const PORT = 8000;



const client = new Client({
  host: "db",
  port: 5432,
  user: "postgres",
  password: "postgress",
  database: "first",
});
const redis = createClient({
  url: "redis://redis:6379",
});

redis.on("error", (err) => console.log(err));

async function main() {
  await client.connect();
  console.log("✅ Connected to PostgreSQL");
  
  const result = await client.query("SELECT NOW()");
  console.log(result.rows);
  
  await client.end();
}
async function redisConnect() {
  await redis.connect();

  console.log("✅ Connected to Redis");

  await redis.set("name", "Rahul");

  const value = await redis.get("name");
  console.log(value);

  await redis.quit();
}

main();
redisConnect();

app.get("/", (req, res) => {
  res.send("TypeScript Backend Running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
