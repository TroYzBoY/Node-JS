exports.createProfile = (req, res, next) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message: 'name болон age шаардлагатай'
      });
    }

    res.json({
      success: true,
      profile: { name, age }
    });

  } catch (err) {
    next(err);
  }
};