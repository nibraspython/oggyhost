import { pipeline } from "@xenova/transformers";
import fs from "fs";
import path from "path";

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

    await loadModel();

    try {
        console.log(`Generating image for: ${prompt}`);
        const imageTensor = await generator(prompt, { num_images: 1, height: 512, width: 512 });

        const publicDir = path.join(process.cwd(), "public");
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        const imagePath = path.join(publicDir, "generated_image.png");
        fs.writeFileSync(imagePath, Buffer.from(imageTensor[0].sample.data));

        res.status(200).json({
            status: "success",
            image_url: "/generated_image.png",
            join: "OGGY_WORKSHOP on Telegram",
            support: "@OGGY_WORKSHOP"
        });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.status(500).json({ error: "Failed to generate image", details: error.message });
    }
}
