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
      user,
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: e.message,
    });
  }
};

/**
 * Controlador para registro
 */
export const register = async (req, res) => {
  console.log("Registro");
  try {
    console.log("Archivo recibido:", req.file);
    const {
      firstName,
      lastName,
      email,
      password,
      role = "CANDIDATE",
      location,
      phone,
      profilePhoto,
    } = req.body;
    console.log(req.body);

    const encryptedPassword = await hash(password);

    let profileImageUrl = profilePhoto;
    if (req.file && req.file.path) {
      profileImageUrl = req.file.path;
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password: encryptedPassword,
      role,
      location,
      phone,
      profilePhoto: profileImageUrl,
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
        profilePhoto: newUser.profilePhoto,
      },
    });
  } catch (error) {
    console.error(
      "Error en registro:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    return res.status(500).json({
      success: false,
      msg: "User registration failed",
      error: error.message,
    });
  }
};
