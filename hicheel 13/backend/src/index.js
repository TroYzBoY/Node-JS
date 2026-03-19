const CircuitBreaker = require("opossum");

async function callExternalService() {
  const random = Math.random();

  if (random < 0.6) {
    throw new Error("Service failed");
  }

  return { message: "Service success" };
}

const breaker = new CircuitBreaker(callExternalService, {
  timeout: 2000,
  errorThresholdPercentage: 50,
  resetTimeout: 4000,
  volumeThreshold: 10,
});

breaker.fallback(() => {
  return { message: "Fallback: service unavailable" };
});

async function runDemo() {
  for (let i = 0; i < 10; i += 1) {
    try {
      const result = await breaker.fire();
      console.log(`[${i + 1}]`, result.message);
    } catch (err) {
      console.log(`[${i + 1}]`, err.message);
    }
  }
}

runDemo()
