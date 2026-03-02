exports.login = (req, res, next) => {
  try {
    const { email, pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({
        success: false,
        message: 'email болон pass шаардлагатай'
      });
    }

    res.json({
      success: true,
      email
    });

  } catch (err) {
    next(err);
  }
};