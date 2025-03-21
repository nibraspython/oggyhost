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

        if (!jsonData || jsonData.error || !jsonData.result || !jsonData.result.url) {
            return res.status(500).json({ error: "Invalid response from API" });
        }

        const videoUrl = jsonData.result.url;

        // Fetch the actual video file
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            return res.status(500).json({ error: "Failed to fetch video file" });
        }

        // Set response headers to serve the video
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", 'inline; filename="video.mp4"');

        // Stream the video to the client
        return videoResponse.body.pipe(res);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch Instagram video", details: error.message });
    }
}
