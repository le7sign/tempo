export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  let results = {};
  
  try {
    // קבלת token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });
    
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;
    
    // בדיקה 1: recommendations
    const recs = await fetch('https://api.spotify.com/v1/recommendations?seed_genres=pop&limit=3&market=US', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const recsText = await recs.text();
    results.recommendations = { status: recs.status, body: recsText.substring(0, 300) };
    
    // בדיקה 2: search
    const search = await fetch('https://api.spotify.com/v1/search?q=pop&type=track&limit=3&market=US', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const searchText = await search.text();
    results.search = { status: search.status, body: searchText.substring(0, 300) };
    
    // בדיקה 3: genres
    const genres = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const genresText = await genres.text();
    results.genres = { status: genres.status, body: genresText.substring(0, 300) };
    
  } catch (err) {
    results.error = err.message;
  }
  
  return res.status(200).json(results);
}
