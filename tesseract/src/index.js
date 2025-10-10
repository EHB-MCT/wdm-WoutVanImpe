const { createWorker } = require("tesseract.js");

const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.post("/OCR", upload.single("image"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No image uploaded" });
		}

		const blob = req.file.buffer;

		const resultText = await runOCR(blob);

		res.json({ success: true, text: resultText });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "OCR failed" });
	}
});

async function runOCR(image) {
	const worker = await createWorker("nld");

	const ret = await worker.recognize(image);

	console.log("OCR Resultaat:");
	console.log(ret.data.text);

	await worker.terminate();

	return ret.data.text;
}

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
