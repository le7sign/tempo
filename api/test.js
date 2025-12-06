export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  // בדיקה 1: האם המפתחות קיימים?
  const hasId = !!clientId;
  const hasSecret = !!clientSecret;
  const idLength = clientId ? clientId.length : 0;
  const secretLength = clientSecret ? clientSecret.length : 0;
  
  // בדיקה 2: נסיון לקבל token
  let tokenResult = null;
  let tokenError = null;
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });
    
    const text = await response.text();
    tokenResult = {
      status: response.status,
      bodyLength: text.length,
      body: text.substring(0, 300)
    };
  } catch (err) {
    tokenError = err.message;
  }
  
  return res.status(200).json({
    envCheck: {
      hasClientId: hasId,
      hasClientSecret: hasSecret,
      clientIdLength: idLength,
      clientSecretLength: secretLength,
      clientIdStart: clientId ? clientId.substring(0, 5) + '...' : null
    },
    tokenResult,
    tokenError
  });
}
