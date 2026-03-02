module.exports = function logger(req, res, next) {
    const start = Date.now();
    const Time = new Date().toISOString();

    res.on("finish", () => {
        const ms = Date.now() - start;
        console.log(`${Time} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
    });
    next();
}
