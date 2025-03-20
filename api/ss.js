export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests allowed" });
  }

  const websiteUrl = req.query.q;
  if (!websiteUrl) {
    return res.status(400).json({ error: "No website URL provided" });
  }

  const screenshotApiKey = "60a829";
  const screenshotUrl = `https://api.screenshotmachine.com/?key=${screenshotApiKey}&dimension=1024x768&url=${encodeURIComponent(websiteUrl)}`;

  try {
    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Screenshot API Error:", errorText);
      return res.status(500).json({ error: "Screenshot API failed", details: errorText });
    }

    const imageData = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(imageData));

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch screenshot", details: error.message });
  }
}
