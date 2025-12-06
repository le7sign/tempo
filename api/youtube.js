async function searchYouTube(title, artist) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing YouTube API key');
  }
  
  const query = `${title} ${artist} official`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`;
  
  const response = await fetch(url);
  const text = await response.text();
  
  if (!text) {
    return null;
  }
  
  const data = JSON.parse(text);
  
  if (!data.items || data.items.length === 0) {
    return null;
  }
  
  const video = data.items[0];
  return {
    youtubeId: video.id.videoId,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle
  };
}

async function searchMultiple(songs, targetCount = 10) {
  const songsToSearch = songs.slice(0, 20);
  
  const searchPromises = songsToSearch.map(async (song) => {
    try {
      const youtube = await searchYouTube(song.title, song.artist);
      
      if (youtube) {
        return {
          ...song,
          youtubeId: youtube.youtubeId,
          youtubeTitle: youtube.title,
          channelTitle: youtube.channelTitle
        };
      }
      return null;
    } catch (error) {
      console.error(`Error searching YouTube for ${song.title}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(searchPromises);
  return results.filter(r => r !== null).slice(0, targetCount);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { songs, targetCount } = req.body;
    
    if (!songs || !Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid songs array' });
    }
    
    const results = await searchMultiple(songs, targetCount || 10);
    return res.status(200).json({ songs: results });
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return res.status(500).json({ error: 'Failed to search YouTube', details: error.message });
  }
}
