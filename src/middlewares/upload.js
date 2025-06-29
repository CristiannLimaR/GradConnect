import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cvAdjuntos',
    allowed_formats: ['pdf', 'doc', 'docx']
  }
});

const upload = multer({ storage });


const profileImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profileImages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

export const uploadProfileImage = multer({ storage: profileImageStorage });

// Middleware para manejar errores de subida de archivos generales
export const uploadWithErrorHandler = (req, res, next) => {
  console.log('UploadWithErrorHandler')
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Middleware para manejar errores de subida de imágenes de perfil
export const uploadProfileImageWithErrorHandler = (req, res, next) => {
  console.log('UploadProfileImageWithErrorHandler')
  uploadProfileImage.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

export default upload;
