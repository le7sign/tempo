const keyMap = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
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
  'ניו זילנד': 'NZ', 'דרום אפריקה': 'ZA',
  'מצרים': 'EG', 'מרוקו': 'MA', 'נגריה': 'NG',
  'סינגפור': 'SG', 'מלזיה': 'MY', 'תאילנד': 'TH',
  'טאיוואן': 'TW', 'הונג קונג': 'HK',
  'אינדונזיה': 'ID', 'פיליפינים': 'PH', 'ויאטנם': 'VN',
  'איחוד האמירויות': 'AE', 'סעודיה': 'SA', 'קטאר': 'QA',
  'קולומביה': 'CO', "צ'ילה": 'CL', 'פרו': 'PE', 'אקוודור': 'EC',
  'רומניה': 'RO', 'אוקראינה': 'UA', 'בולגריה': 'BG', 'קרואטיה': 'HR',
  'איסלנד': 'IS', 'לוקסמבורג': 'LU'
};

const genreMap = {
  'Pop': 'pop', 'Rock': 'rock', 'Hip Hop': 'hip-hop', 'Jazz': 'jazz',
  'Classical': 'classical', 'Electronic': 'electronic', 'R&B': 'r-n-b',
  'Country': 'country', 'Latin': 'latin', 'Metal': 'metal',
  'Indie': 'indie', 'Blues': 'blues', 'Folk': 'folk', 'Reggae': 'reggae',
  'Funk': 'funk', 'Soul': 'soul', 'Disco': 'disco', 'Punk': 'punk',
  'Alternative': 'alternative', 'Grunge': 'grunge', 'House': 'house',
  'Techno': 'techno', 'Trance': 'trance', 'Dubstep': 'dubstep',
  'Ambient': 'ambient', 'Ska': 'ska', 'Gospel': 'gospel',
  'Hard Rock': 'hard-rock', 'Progressive Rock': 'progressive-rock'
};

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials');
  }
  
  console.log('Requesting token...');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
  });
  
  console.log('Token response status:', response.status);
  
  const text = await response.text();
  console.log('Token response:', text ? text.substring(0, 100) : 'EMPTY');
  
  if (!text) {
    throw new Error('Empty response from Spotify token endpoint');
  }
  
  const data = JSON.parse(text);
  if (!data.access_token) {
    throw new Error('Spotify auth failed: ' + text.substring(0, 200));
  }
  
  return data.access_token;
}

async function searchSpotify(params, excludeIds = []) {
  const token = await getSpotifyToken();
  console.log('Got token, searching...');
  
  const { tempoMin, tempoMax, key, scale, timeSignature, genres, regions, vocalType, yearMin, yearMax, artistName } = params;
  
  const recParams = new URLSearchParams();
  
  if (genres && genres.length > 0) {
    const spotifyGenres = genres.map(g => genreMap[g]).filter(Boolean).slice(0, 5);
    if (spotifyGenres.length > 0) {
      recParams.append('seed_genres', spotifyGenres.join(','));
    }
  } else {
    recParams.append('seed_genres', 'pop,rock,hip-hop');
  }
  
  if (tempoMin || tempoMax) {
    const min = parseInt(tempoMin) || 0;
    const max = parseInt(tempoMax) || 300;
    const actualMin = Math.min(min, max);
    const actualMax = Math.max(min, max);
    if (actualMin > 0) recParams.append('min_tempo', actualMin);
    if (actualMax < 300) recParams.append('max_tempo', actualMax);
  }
  
  if (key && keyMap[key] !== undefined) {
    recParams.append('target_key', keyMap[key]);
  }
  
  if (scale) {
    recParams.append('target_mode', scale === 'Major' ? 1 : 0);
  }
  
  if (timeSignature) {
    const ts = parseInt(timeSignature.split('/')[0]);
    recParams.append('target_time_signature', ts);
  }
  
  if (vocalType) {
    if (vocalType === 'אינסטרומנטלי' || vocalType === 'Instrumental') {
      recParams.append('min_instrumentalness', 0.5);
    } else {
      recParams.append('max_instrumentalness', 0.3);
    }
  }
  
  let market = 'US';
  if (regions && regions.length > 0) {
    market = marketMap[regions[0]] || 'US';
  }
  recParams.append('market', market);
  recParams.append('limit', 30);
  
  const url = `https://api.spotify.com/v1/recommendations?${recParams.toString()}`;
  console.log('Spotify URL:', url);
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('Spotify API status:', response.status);
  
  const text = await response.text();
  console.log('Spotify API response length:', text ? text.length : 0);
  console.log('Spotify API response preview:', text ? text.substring(0, 200) : 'EMPTY');
  
  if (!text) {
    throw new Error('Empty response from Spotify API, status: ' + response.status);
  }
  
  const data = JSON.parse(text);
  
  if (!data.tracks) {
    console.log('No tracks field in response');
    return [];
  }
  
  console.log('Got', data.tracks.length, 'tracks');
  
  let tracks = data.tracks;
  
  if (yearMin || yearMax) {
    const minYear = parseInt(yearMin) || 1900;
    const maxYear = parseInt(yearMax) || 2030;
    const actualMinYear = Math.min(minYear, maxYear);
    const actualMaxYear = Math.max(minYear, maxYear);
    tracks = tracks.filter(track => {
      const releaseYear = parseInt(track.album.release_date.substring(0, 4));
      return releaseYear >= actualMinYear && releaseYear <= actualMaxYear;
    });
  }
  
  if (artistName && artistName.trim()) {
    const searchName = artistName.trim().toLowerCase();
    tracks = tracks.filter(track => 
      track.artists.some(artist => artist.name.toLowerCase().includes(searchName))
    );
  }
  
  if (excludeIds && excludeIds.length > 0) {
    tracks = tracks.filter(track => !excludeIds.includes(track.id));
  }
  
  return tracks.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    year: track.album.release_date.substring(0, 4),
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
