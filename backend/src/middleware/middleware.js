import jwt from "jsonwebtoken";

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.userToken;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }


    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedUser;
    next();
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
};

export default authenticateUser;