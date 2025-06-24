import { verify } from "argon2";
import User from "../users/user.model.js";

export const validateLoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Incorrect credentials. Email not found"
      });
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        msg: "This account has been deactivated"
      });
    }

    const validPassword = await verify(user.password, password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        msg: "Incorrect password"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error during login validation",
      error: error.message
    });
  }
};

export const validateRegisterUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        msg: "Email is required"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "The email is already registered"
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Error during registration validation",
      error: error.message
    });
  }
};
