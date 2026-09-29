/*
  middleware/authMiddleware.js — JWT verification middleware

  WHAT IS MIDDLEWARE?
  Middleware is a function that runs BETWEEN receiving a request and handling it.
  Express middleware has this signature: (req, res, next) => {}
  
  - req  → the incoming request
  - res  → the response we'll send back
  - next → a function we call to say "I'm done, pass control to the next function"

  If we call next(), the request moves on to the actual route handler.
  If we call res.json() or res.status().json() WITHOUT calling next(), 
  the request stops here — we've handled it ourselves (usually with an error).

  HOW IT FITS TOGETHER:
  Without middleware:   Request → Route Handler → Response
  With middleware:      Request → authMiddleware → Route Handler → Response

  If authMiddleware decides the token is invalid, it sends a 401 response
  and the route handler never runs. This is how we protect private routes.

  WHERE DOES THE TOKEN COME FROM?
  The frontend sends the token in the "Authorization" HTTP header like this:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  The word "Bearer" is just a standard prefix — it means "the holder of this token."
  We split off the "Bearer " prefix and just use the token part.
*/

const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  // Step 1: Read the Authorization header from the request
  const authHeader = req.headers.authorization

  // Step 2: Check the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized. No token provided.' })
  }

  // Step 3: Extract just the token part (remove "Bearer " prefix)
  // "Bearer eyJhbG..." → "eyJhbG..."
  const token = authHeader.split(' ')[1]

  // Step 4: Verify the token using our JWT_SECRET
  // jwt.verify() checks two things:
  //   1. Was this token signed with our secret? (proves we issued it)
  //   2. Has it expired? (expiresIn: '7d' from when we created it)
  // If either check fails, it throws an error and we catch it below.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Step 5: Attach the decoded payload to req.user
    // decoded looks like: { id: "64abc...", iat: 1234567, exp: 1234567 }
    // We only care about the id — the controller will use req.user.id to fetch the user
    req.user = { id: decoded.id }

    // Step 6: Call next() to pass control to the actual route handler
    next()
  } catch (error) {
    // This runs if the token is invalid OR expired
    return res.status(401).json({ message: 'Not authorized. Token is invalid or expired.' })
  }
}

module.exports = { protect }
