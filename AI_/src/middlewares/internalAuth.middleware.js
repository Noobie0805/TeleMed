import crypto from "crypto";

const internalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({
      error: "Authorization header required",
      required: "Bearer <AI_INTERNAL_KEY>"
    });
  }

  const token = authHeader.slice(7).trim();
  const expected = process.env.AI_INTERNAL_KEY;

  if (!expected) {
    return res.status(500).json({
      error: "Internal authentication not configured"
    });
  }

  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  if (
    tokenBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(tokenBuffer, expectedBuffer)
  ) {
    return res.status(401).json({
      error: "Invalid or expired internal key"
    });
  }

  // Internal trace info (optional)
  req.internalClientIP = req.ip;
  req.isInternalRequest = true;

  next();
};

export { internalAuth };
