const { createWorker } = require("tesseract.js");
const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.TESSERACT_PORT;

// Rate limiting to prevent memory overload
const activeRequests = new Set();
const MAX_CONCURRENT_REQUESTS = 2;

app.use(cors({
	origin: [`http://localhost:${process.env.FRONTEND_PORT}`],
	methods: ['GET', 'POST', 'OPTIONS'],
	credentials: true
}));

// Simple in-memory rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
	if (activeRequests.size >= MAX_CONCURRENT_REQUESTS) {
		return res.status(429).json({ 
			error: "Te veel gelijktijdige verzoeken. Probeer het opnieuw." 
		});
	}
	
	const requestId = Date.now() + Math.random();
	activeRequests.add(requestId);
	
	res.on('finish', () => {
		activeRequests.delete(requestId);
	});
	
	next();
};

/**
 * Handles OCR processing requests.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.post("/OCR", rateLimitMiddleware, upload.single("image"), async (req, res) => {
	console.log("OCR request received:", {
		hasFile: !!req.file,
		fileSize: req.file ? req.file.size : 0,
		activeRequests: activeRequests.size
	});
	
	try {
		if (!req.file) {
			console.error("No file uploaded");
			return res.status(400).json({ error: "Geen afbeelding geüpload" });
		}

		const resultText = await runOCR(req.file.buffer);
		
		console.log("OCR processing completed, text length:", resultText.length);
		res.json({ success: true, text: resultText });
	} catch (err) {
		console.error("OCR Verwerkingsfout:", err);
		res.status(500).json({ error: "OCR verwerking mislukt", details: err.message });
	}
});

/**
 * Extracts text from image buffer using Tesseract OCR.
 * @param {Buffer} imageBuffer - The image buffer to process
 * @returns {Promise<string>} The extracted text from image
 */
async function runOCR(imageBuffer) {
	let worker;
	
	try {
		// Create worker with single language to reduce memory usage
		worker = await createWorker("eng");
		
		// Add memory management settings
		await worker.setParameters({
			tessedit_pagesegmode: "1", // Auto page segmentation
			tessedit_ocr_engine_mode: "1", // LSTM only
		});
		
		const recognitionResult = await worker.recognize(imageBuffer);
		return recognitionResult.data.text;
	} catch (error) {
		console.error("OCR processing error:", error);
		throw error;
	} finally {
		// Always terminate worker to free memory
		if (worker) {
			try {
				await worker.terminate();
			} catch (terminateError) {
				console.error("Error terminating worker:", terminateError);
			}
		}
	}
}


// Memory monitoring and garbage collection
setInterval(() => {
	const used = process.memoryUsage();
	const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
	const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
	
	console.log(`Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
	
	// Force garbage collection if memory usage is high
	if (heapUsedMB > 1024) { // 1GB
		if (global.gc) {
			console.log("Forcing garbage collection...");
			global.gc();
		}
	}
}, 30000); // Check every 30 seconds

// Enable garbage collection
if (process.env.NODE_ENV === 'development') {
	global.gc = require('vm').runInNewContext('gc');
}

app.listen(PORT, () => {
	console.log(`OCR Service draait op http://localhost:${PORT}`);
	console.log(`Max concurrent requests: ${MAX_CONCURRENT_REQUESTS}`);
});
