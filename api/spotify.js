const genreMap = {
  'Pop': 'pop', 'Rock': 'rock', 'Hip Hop': 'hip hop', 'Jazz': 'jazz',
  'Classical': 'classical', 'Electronic': 'electronic', 'R&B': 'r&b',
  'Country': 'country', 'Latin': 'latin', 'Metal': 'metal',
  'Indie': 'indie', 'Blues': 'blues', 'Folk': 'folk', 'Reggae': 'reggae',
  'Funk': 'funk', 'Soul': 'soul', 'Disco': 'disco', 'Punk': 'punk',
  'Alternative': 'alternative', 'Grunge': 'grunge', 'House': 'house',
  'Techno': 'techno', 'Trance': 'trance', 'Dubstep': 'dubstep',
  'Ambient': 'ambient', 'Ska': 'ska', 'Gospel': 'gospel',
  'Hard Rock': 'hard rock', 'Progressive Rock': 'progressive rock'
};

const marketMap = {
  'ישראל': 'IL', 'ארצות הברית': 'US', 'בריטניה': 'GB',
  'צרפת': 'FR', 'ברזיל': 'BR', 'הודו': 'IN', 'ספרד': 'ES',
  'גרמניה': 'DE', 'יפן': 'JP', 'דרום קוריאה': 'KR',
  'רוסיה': 'RU', 'מקסיקו': 'MX', 'ארגנטינה': 'AR',
  'טורקיה': 'TR', 'איטליה': 'IT', 'הולנד': 'NL',
  'בלגיה': 'BE', 'שוויץ': 'CH', 'אוסטריה': 'AT',
  'שוודיה': 'SE', 'נורווגיה': 'NO', 'דנמרק': 'DK',
  'פינלנד': 'FI', 'פולין': 'PL', "צ'כיה": 'CZ',
  'הונגריה': 'HU', 'יוון': 'GR', 'פורטוגל': 'PT',
  'אירלנד': 'IE', 'קנדה': 'CA', 'אוסטרליה': 'AU',
  'ניו זילנד': 'NZ', 'דרום אפריקה': 'ZA'
};

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials');
  }
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
  });
  
  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Spotify auth failed');
  }
  
  return data.access_token;
}

async function searchSpotify(params, excludeIds = []) {
  const token = await getSpotifyToken();
  
  const { genres, regions, yearMin, yearMax, artistName } = params;
  
  // בניית שאילתת חיפוש
  let queryParts = [];
  
  // ז'אנרים
  if (genres && genres.length > 0) {
    const genre = genreMap[genres[0]] || genres[0].toLowerCase();
    queryParts.push(`genre:${genre}`);
  }
  
  // שם אמן
  if (artistName && artistName.trim()) {
    queryParts.push(`artist:${artistName.trim()}`);
  }
  
  // שנים
  if (yearMin && yearMax) {
    queryParts.push(`year:${yearMin}-${yearMax}`);
  } else if (yearMin) {
    queryParts.push(`year:${yearMin}-2025`);
  } else if (yearMax) {
    queryParts.push(`year:1900-${yearMax}`);
  }
  
  // אם אין פילטרים, חפש פופ
  if (queryParts.length === 0) {
    queryParts.push('genre:pop');
  }
  
  const query = queryParts.join(' ');
  
  // שוק
  let market = 'US';
  if (regions && regions.length > 0) {
    market = marketMap[regions[0]] || 'US';
  }
  
  // הוספת אקראיות - offset רנדומלי
  const randomOffset = Math.floor(Math.random() * 100);
  
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=${market}&offset=${randomOffset}`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!data.tracks || !data.tracks.items) {
    // אם אין תוצאות עם offset, נסה בלעדיו
    const fallbackUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=${market}`;
    const fallbackResponse = await fetch(fallbackUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const fallbackData = await fallbackResponse.json();
    
    if (!fallbackData.tracks || !fallbackData.tracks.items) {
      return [];
    }
    
    return processResults(fallbackData.tracks.items, excludeIds);
  }
  
  return processResults(data.tracks.items, excludeIds);
}

function processResults(items, excludeIds) {
  let tracks = items;
  
  // סינון לפי excludeIds
  if (excludeIds && excludeIds.length > 0) {
    tracks = tracks.filter(track => !excludeIds.includes(track.id));
  }
  
  // ערבוב התוצאות
  tracks = tracks.sort(() => Math.random() - 0.5);
  
  // החזרת עד 30 שירים
  return tracks.slice(0, 30).map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    year: track.album.release_date ? track.album.release_date.substring(0, 4) : '',
    spotifyUrl: track.external_urls.spotify
  }));
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
    const { params, excludeIds } = req.body;
    
    if (!params) {
      return res.status(400).json({ error: 'Missing params' });
    }
    
    const tracks = await searchSpotify(params, excludeIds || []);
    return res.status(200).json({ tracks });
  } catch (error) {
    console.error('Spotify API error:', error.message);
    return res.status(500).json({ error: 'Failed to search Spotify', details: error.message });
  }
}
