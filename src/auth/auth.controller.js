import User from "../users/user.model.js";
import { hash } from "argon2";
import { generarJWT } from "../helpers/generate-jwt.js";

/**
 * Controlador para login
 */
export const login = async (req, res) => {
  try {
    const user = req.user;
    const token = await generarJWT(user.id);

    return res.status(200).json({
      success: true,
      msg: "Successful login",
      userDetails: {
        token,
        uId: user.id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        location: user.location,
        phone: user.phone,
        profileImage: user.profileImage,
        summary: user.summary,
        linkedinUrl: user.linkedinUrl
      }
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: e.message
    });
  }
};

/**
 * Controlador para registro
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      surname,
      email,
      password,
      role = "CANDIDATE",
      location,
      phone,
      profileImage,
      summary,
      linkedinUrl
    } = req.body;

    const encryptedPassword = await hash(password);

    const newUser = await User.create({
      name,
      surname,
      email: email.toLowerCase().trim(),
      password: encryptedPassword,
      role,
      location,
      phone,
      profileImage,
      summary,
      linkedinUrl
    });

    return res.status(201).json({
      success: true,
      msg: "User registered successfully",
      userDetails: {
        id: newUser._id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location,
        phone: newUser.phone,
        profileImage: newUser.profileImage,
        summary: newUser.summary,
        linkedinUrl: newUser.linkedinUrl
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "User registration failed",
      error: error.message
    });
  }
};
