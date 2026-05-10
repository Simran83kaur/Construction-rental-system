const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "baba-deep-singh-admin-token";

export const loginAdmin = (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN });
  }

  return res.status(401).json({ message: "Invalid admin credentials" });
};

export const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: "Admin login required" });
  }

  return next();
};
