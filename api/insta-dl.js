import { useState } from "react";

export default function Home() {
    const [videoUrl, setVideoUrl] = useState("");
    const [inputUrl, setInputUrl] = useState("");

    const fetchVideo = async () => {
        if (!inputUrl.trim()) {
            alert("Please enter an Instagram URL");
            return;
        }

        try {
            const response = await fetch(`/api/insta-dl?url=${encodeURIComponent(inputUrl)}`);
            const data = await response.json();

            if (data.error || !data.result || !data.result.url) {
                alert("Failed to fetch video. Try again!");
                return;
            }

            setVideoUrl(data.result.url);
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Error fetching video!");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Instagram Video Downloader</h1>
            <input 
                type="text" 
                placeholder="Enter Instagram URL..." 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                style={styles.input}
            />
            <button onClick={fetchVideo} style={styles.button}>Fetch Video</button>

            {videoUrl && (
                <video controls autoPlay style={styles.video}>
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
}

// API Route to fetch Instagram Video
export async function handler(req, res) {
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
            return res.status(500).json({ error: "Failed to fetch Instagram video" });
        }

        const jsonData = await response.json();
        if (!jsonData || jsonData.error || !jsonData.result || !jsonData.result.url) {
            return res.status(500).json({ error: "Invalid response from API" });
        }

        res.status(200).json(jsonData);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch Instagram video", details: error.message });
    }
}

// Inline CSS for Styling
const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    heading: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    input: {
        padding: "10px",
        width: "60%",
        marginBottom: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    video: {
        width: "100%",
        maxWidth: "600px",
        marginTop: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    },
};
