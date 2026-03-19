const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

let connection = null;
let channel = null;

async function getChannel() {
  if (channel) return channel;

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  connection.on("close", () => {
    connection = null;
    channel = null;
  });

  connection.on("error", () => {
    connection = null;
    channel = null;
  });

  return channel;
}

async function publishEvent(type, data) {
  const ch = await getChannel();
  const queue = type;
  await ch.assertQueue(queue, { durable: true });

  const payload = Buffer.from(
    JSON.stringify({
      type,
      data,
      createdAt: new Date().toISOString(),
    })
  );

  ch.sendToQueue(queue, payload, { persistent: true });
}

module.exports = { publishEvent };
