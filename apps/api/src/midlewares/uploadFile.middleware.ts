import multer from "multer";

// only allow jpeg and png
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // Allow files up to 10MB
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            req.res?.writeHead(400, { "Content-Type": "application/json" });
            req.res?.end(JSON.stringify({ error: "Invalid file type. Only JPEG, PNG and WebP are allowed." }));
        }
    },
});

export default upload;
