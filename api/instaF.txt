import fetch from "node-fetch";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Only GET requests allowed" });
    }

    const { url: instagramUrl } = req.query;
    if (!instagramUrl) {
        return res.status(400).json({ error: "No Instagram URL provided" });
    }

    const apiUrl = `https://insta-dl.hazex.workers.dev/?url=${encodeURIComponent(instagramUrl)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch Instagram video" });
        }

        const jsonData = await response.json();

        if (!jsonData.result?.url) {
            return res.status(500).json({ error: "Invalid response from API" });
        }

        res.status(200).json({
            status: "success",
            result: jsonData.result,
            download_url: jsonData.result.url,
            join: "OGGY_WORKSHOP on Telegram",
            support: "@OGGY_WORKSHOP"
        });

    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
}
