import multer from 'multer';
import { uploadPDFToSupabase } from '../helpers/supabaseUpload.js';

// Configure multer to store files in memory for Supabase upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files for CV uploads
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for CV uploads'), false);
    }
  }
});

/**
 * Middleware to handle PDF upload to Supabase
 */
export const uploadPDFWithSupabase = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // No file uploaded, continue
    }

    const { id } = req.params; // User ID from route params
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // Upload to Supabase
    const uploadResult = await uploadPDFToSupabase(fileBuffer, originalName, id);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        msg: 'Error uploading PDF to storage',
        error: uploadResult.error
      });
    }

    // Add the Supabase URL to request for controller to use
    req.supabaseFileUrl = uploadResult.url;
    next();

  } catch (error) {
    console.error('PDF upload middleware error:', error);
    res.status(500).json({
      success: false,
      msg: 'Error processing PDF upload',
      error: error.message
    });
  }
};

export const pdfUpload = upload.single('cvAdjunto');

export default { uploadPDFWithSupabase, pdfUpload };
