const { createWorker } = require("tesseract.js");
const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.TESSERACT_PORT;

app.use(cors());

/**
 * Handles OCR processing requests.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post("/OCR", upload.single("image"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "Geen afbeelding geüpload" });
		}

		const resultText = await runOCR(req.file.buffer);

		res.json({ success: true, text: resultText });
	} catch (err) {
		console.error("OCR Verwerkingsfout:", err);
		res.status(500).json({ error: "OCR verwerking mislukt" });
	}
});

/**
 * Extracts text from image buffer using Tesseract OCR.
 * @param {Buffer} imageBuffer - The image buffer to process
 * @returns {Promise<string>} The extracted text from the image
 */
async function runOCR(imageBuffer) {
	const worker = await createWorker(["nld", "eng", "fra"]);

	try {
		const recognitionResult = await worker.recognize(imageBuffer);
		return recognitionResult.data.text;
	} finally {
		await worker.terminate();
	}
}

app.listen(PORT, () => {
	console.log(`OCR Service draait op http://localhost:${PORT}`);
});
