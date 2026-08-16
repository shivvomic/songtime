export default async function handler(req, res) {
  const playlistId = req.query.playlist;

  const key = process.env.YOUTUBE_API_KEY;

  const baseUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${key}`;

  let songs = [];

  let pageToken = "";

  try {
    do {
      const url = pageToken ? `${baseUrl}&pageToken=${pageToken}` : baseUrl;

      const response = await fetch(url);

      const data = await response.json();

      if (!data.items) {
        return res.status(500).json({
          error: data,
        });
      }

      const pageSongs = data.items.map((item) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
      }));

      songs = songs.concat(pageSongs);

      pageToken = data.nextPageToken || "";
    } while (pageToken);

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}
