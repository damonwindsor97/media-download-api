# media-download-api
<p>A JavaScript API i intitially created for YT > MP4 for my link utility website</p>
<p>As such the endpoint isn't exactly public, but will be at a later date.</p>

## Uses
<ul>
    <li>Convert & download YouTube videos to MP4 via its URL (Highest available quality)</li>
    <li>Convert & download YouTube videos to MP3 via its URL</li>
    <li>Convert & download Soundcloud songs to MP3 via its URL</li>
    <li>Convert & download Spotify songs to MP3 via its URL</li>
</ul>

## Endpoints

| Method  | Endpoint | Description |
-------------------------|--------------------------|---------------|
| POST | (xxx_xxx)/youtube/getTitle | Gets title back of the Video  |
| POST  | (xxx_xxx)/youtube/downloadMp4 | Downloads an Mp4 video at highest quality  |
| POST | (xxx_xxx)/youtube/downloadMp3 | Downloads an Mp3 audio format |
| POST | (xxx_xxx)/soundcloud/getInfo | Gets all information back of the track |
| POST | (xxx_xxx)/soundcloud/getTitle | Gets title back of the track |
| POST | (xxx_xxx)/soundcloud/downloadMp3 | Downloads an Mp3 audio format |
| POST | (xxx_xxx)/spotify/getInfo | Gets all information back of the track |
| POST | (xxx_xxx)/spotify/getTitle | Gets title back of the track |
| POST | (xxx_xxx)/spotify/downloadMp3 | Downloads an Mp3 audio format |

## Usage

### Example
<p>Get Title & Download YouTube </p>

```js
    const downloadFunction = async () => {
        const youtubeUrl = document.getElementById("linkInput").value;

        try {
          setLoading(true);
          setError(false);
            const video = await axios.post("******/youtube/downloadMp3", 
            { link: youtubeUrl },
            {
            responseType: 'blob',
            });
        
            const title =  await axios.post("******/youtube/getTitle",
            { link: youtubeUrl }
            );
            console.log(title.data);
        
            const blob = new Blob([video.data], { type: 'audio/m4a'});
        
            setSuccess(true);
            setLoading(false);
        } catch (error) {
          setLoading(false);
          setError(true);
          console.log(error);
        }
    };
```
