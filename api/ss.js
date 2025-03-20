export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests allowed" });
  }

  const websiteUrl = req.query.q;
  if (!websiteUrl) {
    return res.status(400).json({ error: "No website URL provided" });
  }

  const screenshotApiKey = process.env.SCREENSHOT_API_KEY;
  const screenshotUrl = `https://api.screenshotmachine.com/?key=${screenshotApiKey}&dimension=1024x768&url=${encodeURIComponent(websiteUrl)}`;

  try {
    const response = await fetch(screenshotUrl);
    const imageData = await response.buffer();

    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageData);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenshot" });
  }
}
