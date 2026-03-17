import ApiError from "../utils/apiError.utils.js";

const validate = (schema) => (req, res, next) => {

  const result = schema.safeParse(req.body);

  if (!result.success) {

    const message = result.error.issues[0]?.message || "Invalid request data";

    return next(new ApiError(400, message));
  }

  req.body = result.data;
  next();
};

export default validate;