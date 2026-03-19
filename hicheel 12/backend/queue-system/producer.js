import "dotenv/config";
import amqp from "amqplib";

const QUEUE = "student.created";
const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

async function sendEvent() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });

  const student = {
    id: 101,
    name: "Bat",
    email: "bat@gmail.com",
    createdAt: new Date().toISOString(),
  };

  const payload = Buffer.from(JSON.stringify(student));
  channel.sendToQueue(QUEUE, payload, { persistent: true });
  console.log("Event published:", student);

  setTimeout(() => {
    connection.close();
  }, 500);
}

sendEvent().catch((error) => {
  console.error("Producer error:", error);
  process.exit(1);
});
