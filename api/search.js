export default async function handler(req, res) {
  const query = req.query.q;

  const key = process.env.YOUTUBE_API_KEY;

  if (!query) {
    return res.status(400).json({
      error: "Missing search query",
    });
  }

  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet` +
    `&type=video` +
    `&videoCategoryId=10` +
    `&maxResults=15` +
    `&q=${encodeURIComponent(query)}` +
    `&key=${key}`;

  try {
    const response = await fetch(url);

    const data = await response.json();

    if (!data.items) {
      return res.status(500).json({
        error: data,
      });
    }

    const results = data.items.map(function (item) {
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails && item.snippet.thumbnails.default
            ? item.snippet.thumbnails.default.url
            : "",
      };
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}
