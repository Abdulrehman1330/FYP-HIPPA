const { validationResult } = require("express-validator");
const { AppError } = require("./error.middleware");

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(
      errors
        .array()
        .map((e) => e.msg)
        .join(", "),
      400,
    );
  }
  next();
};

module.exports = { validate };
