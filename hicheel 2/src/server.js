require("dotenv").config();
const app = require("./app");
const auth = require("./middleware/auth");
const validateUser = require("./middleware/validateUser");
const errorHandler = require("./middleware/errHandler");

const data = require("./app.json");
const PORT = process.env.PORT || 8000;


// PUBLIC ROUTE
app.get("/", (req, res) => {
  res.json(data);
});


// LOGIN
app.post("/login", validateUser, (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = data.users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      return next(err);
    }

    res.json({
      message: "Login success",
      user: user.username
    });

  } catch (err) {
    next(err);
  }
});


// PROTECTED ROUTE
app.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user
  });
});


// ERROR HANDLER (хамгийн доор!)
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});