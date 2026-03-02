const test = require("node:test");
const assert = require("node:assert/strict");

function createRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function loadFresh(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

test("auth returns 401 when Authorization header is missing", () => {
  process.env.API_TOKEN = "secret";
  const auth = loadFresh("../src/middleware/auth");

  const req = { headers: {} };
  const res = createRes();
  let nextCalled = false;

  auth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Unauthorized" });
});

test("auth returns 401 for invalid token", () => {
  process.env.API_TOKEN = "secret";
  const auth = loadFresh("../src/middleware/auth");

  const req = { headers: { authorization: "Bearer wrong" } };
  const res = createRes();
  let nextCalled = false;

  auth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Unauthorized" });
});

test("auth sets req.user and calls next for valid token", () => {
  process.env.API_TOKEN = "secret";
  const auth = loadFresh("../src/middleware/auth");

  const req = { headers: { authorization: "Bearer secret" } };
  const res = createRes();
  let nextCalled = false;

  auth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    username: "ervvgiinUser",
    role: "admin"
  });
});

test("rateLimit blocks the 4th request in 10-second window", () => {
  const rateLimit = loadFresh("../src/middleware/rateLimit");
  const req = { ip: "127.0.0.1" };

  for (let i = 0; i < 3; i += 1) {
    const res = createRes();
    let nextCalled = false;

    rateLimit(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  }

  const blockedRes = createRes();
  let blockedNextCalled = false;

  rateLimit(req, blockedRes, () => {
    blockedNextCalled = true;
  });

  assert.equal(blockedNextCalled, false);
  assert.equal(blockedRes.statusCode, 429);
  assert.deepEqual(blockedRes.body, {
    message: "Too many requests. Try again later."
  });
});

test("rateLimit allows requests again after window expires", () => {
  const originalNow = Date.now;
  const rateLimit = loadFresh("../src/middleware/rateLimit");
  const req = { ip: "10.0.0.1" };

  try {
    Date.now = () => 1000;
    for (let i = 0; i < 3; i += 1) {
      rateLimit(req, createRes(), () => {});
    }

    Date.now = () => 12000;
    const res = createRes();
    let nextCalled = false;

    rateLimit(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  } finally {
    Date.now = originalNow;
  }
});

test("logger logs request details on finish", () => {
  const logger = loadFresh("../src/middleware/logger");
  const originalNow = Date.now;
  const originalLog = console.log;

  const logs = [];
  let finishHandler;

  try {
    Date.now = () => 1000;
    console.log = (msg) => logs.push(msg);

    const req = { method: "GET", originalUrl: "/api/students" };
    const res = {
      statusCode: 200,
      on(event, cb) {
        if (event === "finish") {
          finishHandler = cb;
        }
      }
    };

    let nextCalled = false;
    logger(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(typeof finishHandler, "function");

    Date.now = () => 1125;
    finishHandler();

    assert.equal(logs.length, 1);
    assert.match(logs[0], /GET \/api\/students -> 200 \(125ms\)/);
  } finally {
    Date.now = originalNow;
    console.log = originalLog;
  }
});

test("errHandler sends provided status and message", () => {
  const errHandler = loadFresh("../src/middleware/errHandler");
  const res = createRes();

  const err = new Error("Bad Request");
  err.status = 400;

  errHandler(err, {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "Bad Request"
  });
});

test("validateuser passes error to next when username/password missing", () => {
  const validateUser = loadFresh("../src/middleware/validateuser");
  const req = { body: { username: "", password: "" } };

  let receivedErr;
  validateUser(req, {}, (err) => {
    receivedErr = err;
  });

  assert.equal(receivedErr instanceof Error, true);
  assert.equal(receivedErr.status, 400);
  assert.equal(receivedErr.message, "Username and password required");
});

test("validateuser calls next with no error for valid payload", () => {
  const validateUser = loadFresh("../src/middleware/validateuser");
  const req = { body: { username: "alice", password: "secret123" } };

  let receivedErr = null;
  let called = false;

  validateUser(req, {}, (err) => {
    called = true;
    receivedErr = err;
  });

  assert.equal(called, true);
  assert.equal(receivedErr, undefined);
});
