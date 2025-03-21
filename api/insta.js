export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Only GET requests allowed" });
    }

    const instagramUrl = req.query.url;
    if (!instagramUrl) {
        return res.status(400).json({ error: "No Instagram URL provided" });
    }

    const apiUrl = `https://insta-dl.hazex.workers.dev/?url=${encodeURIComponent(instagramUrl)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Instagram API Error:", errorText);
            return res.status(500).json({ error: "Failed to fetch Instagram video", details: errorText });
        }

        const jsonData = await response.json();

        // ✅ Customizing JSON response
        const customData = {
            status: "success", // Adding status
            result: jsonData.result || {}, // Keeping the original result
            join: "OGGY_WORKSHOP on Telegram",
            support: "@OGGY_WORKSHOP" // Custom field
        };

        res.status(200).json(customData);
        
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch Instagram video", details: error.message });
    }
}
