# media-download-api
<p>A JavaScript API i intitially created for YT > MP4 for my link utility website</p>

## Uses
<ul>
    <li>Convert & download YouTube videos to MP4 via its URL (Highest available quality)</li>
    <li>Convert & download YouTube videos to MP3 via its URL</li>
    <li>Convert & download Soundcloud songs to MP3 via its URL</li>
</ul>

## Endpoints

| Method  | Endpoint | Description |
-------------------------|--------------------------|---------------|
| POST | (xxx_xxx)/youtube/getTitle | Gets title back of the Video  |
| POST  | (xxx_xxx)/youtube/downloadMp4 | Downloads an Mp4 video at highest quality  |
| POST | (xxx_xxx)/youtube/downloadMp3 | Downloads an Mp3 audio format |
| POST | (xxx_xxx)/soundcloud/downloadMp3 | Downloads an Mp3 audio format |

## Usage

### Examples
<p>Getting Title and Downloading Mp4 of video. </p>

```js
    async function handleDownload() {
        const youtubeURL = document.getElementById("linkInput").value;
    
        try {

            const title = await axios.post('http://localhost:5000/youtube/getTitle', 
                { link: youtubeURL }
            );

            const video = await axios.post('http://localhost:5000/youtube/downloadMp4', 
                { link: youtubeURL }, 
                { responseType: 'blob' }
            );

        console.log(title.data)
        } catch (error) {
        console.log(error)
        }
    }
```
