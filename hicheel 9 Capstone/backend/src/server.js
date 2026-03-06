require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const selfsigned = require("selfsigned");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const ENABLE_HTTPS = process.env.ENABLE_HTTPS !== "false";

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`HTTP server running on port ${PORT}`);
});

const ensureCertificate = async () => {
  const certDir = path.join(__dirname, "..", "certs");
  const keyPath = path.join(certDir, "localhost-key.pem");
  const certPath = path.join(certDir, "localhost-cert.pem");

  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    const attrs = [{ name: "commonName", value: "localhost" }];
    const pems = await selfsigned.generate(attrs, {
      days: 365,
      keySize: 2048,
      algorithm: "sha256",
    });
    if (!pems?.private || !pems?.cert) {
      throw new Error("Failed to generate HTTPS certificate");
    }
    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
};

if (ENABLE_HTTPS) {
  (async () => {
    try {
      const ssl = await ensureCertificate();
      const httpsServer = https.createServer(ssl, app);
      httpsServer.listen(HTTPS_PORT, () => {
        logger.info(`HTTPS server running on port ${HTTPS_PORT}`);
      });
    } catch (error) {
      logger.error(`HTTPS startup failed: ${error.message}`);
    }
  })();
}
