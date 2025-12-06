export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  let tokenResult = null;
  let recsResult = null;
  let error = null;
  
  try {
    // שלב 1: קבלת token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });
    
    const tokenText = await tokenResponse.text();
    const tokenData = JSON.parse(tokenText);
    tokenResult = { status: tokenResponse.status, hasToken: !!tokenData.access_token };
    
    if (!tokenData.access_token) {
      throw new Error('No token');
    }
    
    // שלב 2: קריאה ל-recommendations
    const recsUrl = 'https://api.spotify.com/v1/recommendations?seed_genres=pop&limit=5&market=US';
    const recsResponse = await fetch(recsUrl, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    const recsText = await recsResponse.text();
    recsResult = {
      status: recsResponse.status,
      bodyLength: recsText.length,
      preview: recsText.substring(0, 500)
    };
    
  } catch (err) {
    error = err.message;
  }
  
  return res.status(200).json({ tokenResult, recsResult, error });
}
