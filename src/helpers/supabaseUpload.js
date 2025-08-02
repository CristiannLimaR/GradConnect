import supabase from '../../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload PDF file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadPDFToSupabase = async (fileBuffer, originalName, userId) => {
  try {
    // Generate unique filename
    const fileExtension = originalName.split('.').pop();
    const fileName = `${userId}_${uuidv4()}.${fileExtension}`;
    const filePath = fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('cvs') // Using user's actual bucket name
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('row-level security')) {
        errorMessage = 'Storage bucket access denied. Please check RLS policies or disable RLS for the cvs bucket.';
      } else if (error.message.includes('Invalid Compact JWS')) {
        errorMessage = 'Invalid authentication token. Please check your Supabase service role key.';
      } else if (error.message.includes('Bucket not found')) {
        errorMessage = 'Storage bucket "cvs" not found. Please create the bucket in Supabase.';
      }
      
      return {
        success: false,
        error: errorMessage,
        originalError: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cvs')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete PDF file from Supabase Storage
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deletePDFFromSupabase = async (fileUrl) => {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = fileName;

    const { error } = await supabase.storage
      .from('cvs')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
