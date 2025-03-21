import { pipeline } from "@xenova/transformers";

// Load model globally
let generator = null;
async function loadModel() {
    if (!generator) {
        console.log("Loading AI model...");
        generator = await pipeline("text-to-image", "Xenova/stable-diffusion-v1-4"); // ✅ Corrected pipeline
        console.log("Model loaded.");
    }
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Only GET requests allowed" });
    }

    const prompt = req.query.prompt;
    if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
    }

    await loadModel(); // Ensure model is loaded

    try {
        console.log(`Generating image for: ${prompt}`);
        const imageTensor = await generator(prompt, { num_images: 1, height: 512, width: 512 });

        // Convert image to Base64 (since file storage isn't available on Vercel)
        const buffer = await imageTensor[0].sample.toBuffer("png");
        const base64Image = buffer.toString("base64");

        // ✅ Custom JSON response (Base64 Image)
        const responseData = {
            status: "success",
            image_base64: `data:image/png;base64,${base64Image}`, // ✅ Directly send base64 image
            join: "OGGY_WORKSHOP on Telegram",
            support: "@OGGY_WORKSHOP"
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error("Image Generation Error:", error);
        res.status(500).json({ error: "Failed to generate image", details: error.message });
    }
}
