import { pipeline } from "@xenova/transformers";
import fs from "fs";
import path from "path";

// Load model globally
let generator = null;
async function loadModel() {
    if (!generator) {
        console.log("Loading AI model...");
        generator = await pipeline("image-to-image", "Xenova/stable-diffusion-v1-4");
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

        // Save the image
        const imagePath = path.join(process.cwd(), "public", "generated_image.png");
        fs.writeFileSync(imagePath, imageTensor[0].sample.toBuffer("png"));

        // ✅ Custom JSON response
        const responseData = {
            status: "success",
            image_url: "/generated_image.png", // Relative path for frontend use
            join: "OGGY_WORKSHOP on Telegram",
            support: "@OGGY_WORKSHOP"
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error("Image Generation Error:", error);
        res.status(500).json({ error: "Failed to generate image", details: error.message });
    }
}
