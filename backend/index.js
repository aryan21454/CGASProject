import express from 'express';
import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import { fileURLToPath } from 'url'; // Import fileURLToPath


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json()); // Middleware to parse JSON request body

// Create a downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir); // Now this should work correctly
}

// Route to download YouTube video
app.post('/download', async (req, res) => {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
        return res.status(400).json({ error: 'YouTube URL is required.' });
    }

    try {
        // Validate the YouTube URL
        const isValid = ytdl.validateURL(youtubeUrl);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid YouTube URL.' });
        }

        // Generate unique filename
        const videoId = ytdl.getVideoID(youtubeUrl);
        const outputFilePath = path.join(downloadsDir, `video_${videoId}.mp4`);
        const options = {
            quality: 'highestvideo',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        };
        // St ream video and save to file
        const videoStream = ytdl(youtubeUrl, options);
        const writeStream = fs.createWriteStream(outputFilePath);

        videoStream.pipe(writeStream);

        // Respond when the video has been fully downloaded
        writeStream.on('finish', () => {
            res.status(200).json({
                message: 'Video downloaded successfully.',
                filePath: outputFilePath,
            });
        });

        // Handle errors
        videoStream.on('error', (error) => {
            console.error('Error downloading video:', error);
            res.status(500).json({ error: 'Failed to download video.' });
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
