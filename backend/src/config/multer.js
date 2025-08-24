import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/'); // Make sure this folder exists
    },
    filename: function (req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Add file filter to handle unexpected fields more gracefully
const fileFilter = (req, file, callback) => {
    // Allow specific image fields
    const allowedFields = ['image1', 'image2', 'image3', 'image4'];
    
    if (allowedFields.includes(file.fieldname)) {
        callback(null, true);
    } else {
        console.warn(`Unexpected field: ${file.fieldname}`);
        // Accept the file but log the warning
        callback(null, true);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 4 // Maximum 4 files
    }
});

export default upload;