const express = require("express");
const multer = require("multer");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "pdfs" directory
app.use("/pdfs", express.static("pdfs"));

// File upload setup
const upload = multer({ dest: "uploads/" });

// Route to handle file uploads
app.post("/convert-to-pdf", upload.array("images", 10), (req, res) => {
    const images = req.files;
    if (!images || images.length === 0) {
        return res.status(400).json({ error: "No images provided!" });
    }

    // Create a PDF document
    const pdfPath = `pdfs/output_${Date.now()}.pdf`;
    const doc = new PDFDocument();

    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Add images to the PDF
    images.forEach((image) => {
        const imgPath = image.path;
        const { width, height } = doc.page;
        doc.image(imgPath, 0, 0, { fit: [width, height] }).addPage();
        fs.unlinkSync(imgPath); // Delete temporary image file
    });

    doc.end();

    writeStream.on("finish", () => {
        res.json({ pdfUrl: `http://localhost:${PORT}/${pdfPath}` });
    });

    writeStream.on("error", (err) => {
        res.status(500).json({ error: "Error generating PDF" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
