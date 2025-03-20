export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests allowed" });
  }

  const { url, tool } = req.query;
  if (!url || !tool) {
    return res.status(400).json({ error: "Missing required parameters: url and tool" });
  }

  const apiEndpoints = {
    removebg: "https://api.remove.bg/v1.0/removebg",
    enhance: "https://api.deepai.org/api/torch-srgan",
    upscale: "https://api.deepai.org/api/waifu2x",
    restore: "https://api.deepai.org/api/image-editor",
    colorize: "https://api.deepai.org/api/colorizer"
  };

  const apiKeys = {
    removebg: process.env.REMOVEBG_API_KEY,
    deepai: process.env.DEEPAI_API_KEY
  };

  if (!apiEndpoints[tool]) {
    return res.status(400).json({ error: "Invalid tool specified" });
  }

  try {
    const apiUrl = apiEndpoints[tool];
    const headers = tool === "removebg" ? { "X-Api-Key": apiKeys.removebg } : { "api-key": apiKeys.deepai };
    const body = new URLSearchParams({ image_url: url });

    const apiResponse = await fetch(apiUrl, { method: "POST", headers, body });
    const jsonResponse = await apiResponse.json();
    const resultUrl = jsonResponse.output_url || jsonResponse.data?.output_url;

    if (!resultUrl) {
      throw new Error("No output received");
    }

    const finalImageResponse = await fetch(resultUrl);
    res.setHeader("Content-Type", finalImageResponse.headers.get("Content-Type"));
    finalImageResponse.body.pipe(res);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
