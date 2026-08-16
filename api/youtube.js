export default async function handler(req, res) {

    const playlistId =
        req.query.playlist;


    const key =
        process.env.YOUTUBE_API_KEY;


    const url =
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${key}`;


    const response =
        await fetch(url);


    const data =
        await response.json();


    const songs =
        data.items.map(item => ({
            id:
                item.snippet.resourceId.videoId,

            title:
                item.snippet.title
        }));


    res.status(200).json(songs);
}