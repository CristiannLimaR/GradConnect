import { response } from "express";
import { hash } from "argon2";
import User from "./user.model.js";

/**
 * Obtener todos los usuarios activos
 */
export const getUsers = async (req, res = response) => {
  try {
    const users = await User.find({ status: true });

    res.status(200).json({
      success: true,
      msg: "Users fetched successfully",
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching users",
      error: error.message
    });
  }
};

/**
 * Actualizar información del usuario
 */
export const updateUser = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { _id, password, email, ...data } = req.body;

    if (password) {
      data.password = await hash(password);
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating user",
      error: error.message
    });
  }
};

/**
 * Desactivar un usuario (soft delete)
 */
export const deleteUser = async (req, res = response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, { status: false }, { new: true });

    res.status(200).json({
      success: true,
      msg: "User deleted (status set to false)",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error deleting user",
      error: error.message
    });
  }
};

/**
 * Actualizar solo la contraseña
 */
export const updatedPassword = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        msg: "Password is required"
      });
    }

    const encryptedPassword = await hash(password);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: encryptedPassword },
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: "Password updated successfully",
      updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating password",
      error: error.message
    });
  }
};

/**
 * Crear automáticamente un administrador GRADCONNECT si no existe
 */
export const crateAdmin = async () => {
  try {
    const adminD = await User.findOne({ email: "admin@gradconnect.com" });

    if (!adminD) {
      const passwordEncrypted = await hash("Admin123");

      const admin = new User({
        name: "Admin",
        surname: "GradConnect",
        email: "admin@gradconnect.com",
        password: passwordEncrypted,
        role: "GRADCONNECT"
      });

      await admin.save();
      console.log("GradConnect admin created");
    } else {
      console.log("GradConnect admin already exists");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};
