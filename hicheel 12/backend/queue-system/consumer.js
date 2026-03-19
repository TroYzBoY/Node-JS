import "dotenv/config";
import amqp from "amqplib";

const QUEUE = "student.created";
const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

async function consume() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });
  await channel.prefetch(5);

  console.log("Waiting for events...");

  channel.consume(QUEUE, (msg) => {
    if (!msg) return;
    try {
      const student = JSON.parse(msg.content.toString());
      console.log("Notification Service");
      console.log("Welcome email sent to", student.email);
      channel.ack(msg);
    } catch (error) {
      console.error("Consumer error:", error);
      channel.nack(msg, false, false);
    }
  });
}

consume().catch((error) => {
  console.error("Consumer startup error:", error);
  process.exit(1);
});
