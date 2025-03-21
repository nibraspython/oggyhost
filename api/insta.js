// pages/api/insta.js (API Backend)
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
        const videoUrl = jsonData.result?.url || "";

        const customData = {
            status: "success",
            result: jsonData.result || {},
            download_url: videoUrl,
            join: "KUNDY on Telegram",
            support: "@JERRTY"
        };

        res.status(200).json(customData);
        
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch Instagram video", details: error.message });
    }
}

// pages/index.js (Frontend UI)
import { useState } from "react";

export default function InstagramDownloader() {
    const [url, setUrl] = useState("");
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchVideo = async () => {
        if (!url.trim()) return alert("Please enter a valid Instagram URL");

        setLoading(true);
        setVideoUrl(null);

        try {
            const res = await fetch(`/api/insta?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (data.status === "success" && data.download_url) {
                setVideoUrl(data.download_url);
            } else {
                alert("Failed to fetch video");
            }
        } catch (error) {
            alert("Error fetching video");
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-5">
            <h1 className="text-3xl font-bold mb-4">Instagram Video Downloader</h1>
            <input
                type="text"
                placeholder="Enter Instagram Video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full max-w-lg p-3 rounded-lg border border-gray-400 text-black"
            />
            <button
                onClick={fetchVideo}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition"
            >
                {loading ? "Fetching..." : "Download Video"}
            </button>
            {videoUrl && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
                    <p className="mb-2">Click below to download:</p>
                    <a
                        href={videoUrl}
                        download
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg inline-block transition"
                    >
                        Download Video
                    </a>
                </div>
            )}
        </div>
    );
}
