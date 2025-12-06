import React, { useState } from 'react';

// לוגו מקלות תופים - עיצוב אופקי בהשראת סליידרים
const DrumstickLogo = ({ className, style }) => (
  <svg 
    className={className}
    style={style}
    viewBox="0 0 32 28" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* מקל עליון - עיגול מחובר */}
    <line x1="6" y1="9" x2="26" y2="9" strokeWidth="2.5" />
    <circle cx="10" cy="9" r="4" fill="currentColor" stroke="none" />
    
    {/* מקל תחתון - עיגול עם ניתוק */}
    <line x1="6" y1="19" x2="14" y2="19" strokeWidth="2.5" />
    <line x1="18" y1="19" x2="26" y2="19" strokeWidth="2.5" />
    <circle cx="22" cy="19" r="4" fill="currentColor" stroke="none" />
  </svg>
);

// אייקונים
const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const MusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const LanguageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlayIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

export default function BaKetzev() {
  const [language, setLanguage] = useState('he');
  const [tempoMin, setTempoMin] = useState('');
  const [tempoMax, setTempoMax] = useState('');
  const [key, setKey] = useState('');
  const [scale, setScale] = useState('');
  const [vocalType, setVocalType] = useState('');
  const [timeSignature, setTimeSignature] = useState('');
  const [genres, setGenres] = useState([]);
  const [regions, setRegions] = useState([]);
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [artistName, setArtistName] = useState('');
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [showMoreRegions, setShowMoreRegions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [songs, setSongs] = useState([]);
  const [searchedSongIds, setSearchedSongIds] = useState(new Set());
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const [error, setError] = useState(null);
  const [pendingSpotifyTracks, setPendingSpotifyTracks] = useState([]); // שירים מספוטיפיי שעוד לא חיפשנו ביוטיוב

  // קבועים
  const SEARCH_TIMEOUT = 30000; // 30 שניות מקסימום לחיפוש

  // טעינת פונט עברי עבה - מוסר כי הפונט נטען ב-HTML
  // React.useEffect(() => {
  //   const link = document.createElement('link');
  //   link.href = 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap';
  //   link.rel = 'stylesheet';
  //   document.head.appendChild(link);
  //   return () => document.head.removeChild(link);
  // }, []);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const scales = ['Major', 'Minor'];
  const vocalTypesHe = ['שיר עם מילים', 'אינסטרומנטלי'];
  const vocalTypesEn = ['With Lyrics', 'Instrumental'];
  const timeSignatures = ['4/4', '3/4'];
  
  // ז'אנרים ראשיים - מוצגים בחוץ
  const mainGenreOptions = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Latin', 'Metal', 'Indie', 'Blues'];
  
  // כל הז'אנרים הנוספים
  const moreGenreOptions = [
    'Folk', 'Reggae', 'Funk', 'Soul', 'Disco', 'Punk',
    'Alternative', 'Grunge', 'House', 'Techno', 'Trance',
    'Dubstep', 'Ambient', 'Ska', 'Gospel', 'Blues Rock',
    'Hard Rock', 'Progressive Rock', 'Psychedelic', 'Shoegaze',
    'Post Rock', 'Emo', 'Screamo', 'Metalcore', 'Death Metal',
    'Black Metal', 'Thrash Metal', 'Power Metal', 'Symphonic Metal'
  ];
  
  // כל הז'אנרים יחד (לחלון הבחירה)
  const allGenreOptions = [...mainGenreOptions, ...moreGenreOptions];
  
  // מדינות ראשיות
  const mainRegionOptions = ['ישראל', 'ארצות הברית', 'בריטניה', 'צרפת', 'ברזיל', 'הודו'];

  // מדינות נוספות - רשימה מאוזנת מ-Spotify
  const moreRegionOptions = [
    'ספרד', 'גרמניה', 'יפן', 'דרום קוריאה', 'רוסיה',
    'מקסיקו', 'ארגנטינה', 'טורקיה', 'איטליה', 'הולנד',
    'בלגיה', 'שוויץ', 'אוסטריה', 'שוודיה', 'נורווגיה',
    'דנמרק', 'פינלנד', 'פולין', "צ'כיה", 'הונגריה',
    'יוון', 'פורטוגל', 'אירלנד', 'קנדה', 'אוסטרליה',
    'ניו זילנד', 'דרום אפריקה', 'מצרים', 'מרוקו', 'נגריה',
    'סינגפור', 'מלזיה', 'תאילנד', 'טאיוואן', 'הונג קונג',
    'אינדונזיה', 'פיליפינים', 'ויאטנם',
    'איחוד האמירויות', 'סעודיה', 'קטאר',
    'קולומביה', 'צ\'ילה', 'פרו', 'אקוודור',
    'רומניה', 'אוקראינה', 'בולגריה', 'קרואטיה',
    'איסלנד', 'לוקסמבורג'
  ];

  // כל המדינות יחד
  const allRegionOptions = [...mainRegionOptions, ...moreRegionOptions];

  const countryTranslations = {
    'ישראל': 'Israel', 'ארצות הברית': 'United States', 'בריטניה': 'United Kingdom',
    'צרפת': 'France', 'ברזיל': 'Brazil', 'הודו': 'India', 'ספרד': 'Spain',
    'גרמניה': 'Germany', 'יפן': 'Japan', 'דרום קוריאה': 'South Korea',
    'רוסיה': 'Russia', 'מקסיקו': 'Mexico', 'ארגנטינה': 'Argentina',
    'טורקיה': 'Turkey', 'איטליה': 'Italy', 'הולנד': 'Netherlands',
    'בלגיה': 'Belgium', 'שוויץ': 'Switzerland', 'אוסטריה': 'Austria',
    'שוודיה': 'Sweden', 'נורווגיה': 'Norway', 'דנמרק': 'Denmark',
    'פינלנד': 'Finland', 'פולין': 'Poland', "צ'כיה": 'Czech Republic',
    'הונגריה': 'Hungary', 'יוון': 'Greece', 'פורטוגל': 'Portugal',
    'אירלנד': 'Ireland', 'קנדה': 'Canada', 'אוסטרליה': 'Australia',
    'ניו זילנד': 'New Zealand', 'דרום אפריקה': 'South Africa',
    'מצרים': 'Egypt', 'מרוקו': 'Morocco', 'נגריה': 'Nigeria',
    'סינגפור': 'Singapore', 'מלזיה': 'Malaysia', 'תאילנד': 'Thailand',
    'טאיוואן': 'Taiwan', 'הונג קונג': 'Hong Kong',
    'אינדונזיה': 'Indonesia', 'פיליפינים': 'Philippines', 'ויאטנם': 'Vietnam',
    'איחוד האמירויות': 'UAE', 'סעודיה': 'Saudi Arabia', 'קטאר': 'Qatar',
    'קולומביה': 'Colombia', 'צ\'ילה': 'Chile', 'פרו': 'Peru', 'אקוודור': 'Ecuador',
    'רומניה': 'Romania', 'אוקראינה': 'Ukraine', 'בולגריה': 'Bulgaria', 'קרואטיה': 'Croatia',
    'איסלנד': 'Iceland', 'לוקסמבורג': 'Luxembourg'
  };

  // תרגום ז'אנרים לעברית
  const genreHebrew = {
    'Pop': 'פופ', 'Rock': 'רוק', 'Hip Hop': 'היפ הופ', 'Jazz': "ג'אז",
    'Classical': 'קלאסי', 'Electronic': 'אלקטרוני', 'R&B': 'R&B',
    'Country': 'קאנטרי', 'Latin': 'לטיני', 'Metal': 'מטאל',
    'Indie': 'אינדי', 'Blues': 'בלוז', 'Folk': 'פולק', 'Reggae': 'רגאיי',
    'Funk': 'פאנק', 'Soul': 'סול', 'Disco': 'דיסקו', 'Punk': 'פאנק',
    'Alternative': 'אלטרנטיבי', 'Grunge': 'גראנג\'', 'House': 'האוס',
    'Techno': 'טכנו', 'Trance': 'טראנס', 'Dubstep': 'דאבסטפ',
    'Ambient': 'אמביינט', 'Ska': 'סקא', 'Gospel': 'גוספל',
    'Blues Rock': 'בלוז רוק', 'Hard Rock': 'הארד רוק',
    'Progressive Rock': 'רוק פרוגרסיבי', 'Psychedelic': 'פסיכדלי',
    'Shoegaze': 'שוגייז', 'Post Rock': 'פוסט רוק', 'Emo': 'אמו',
    'Screamo': 'סקרימו', 'Metalcore': 'מטאלקור', 'Death Metal': 'דת\' מטאל',
    'Black Metal': 'בלאק מטאל', 'Thrash Metal': 'ת\'ראש מטאל',
    'Power Metal': 'פאוור מטאל', 'Symphonic Metal': 'מטאל סימפוני'
  };

  const isRTL = language === 'he';
  const primaryColor = '#6C032D';

  // סגנון אחיד לכל השדות
  const inputStyle = {
    height: '28px',
    fontSize: '12px',
    padding: '0 8px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: '#ffffff',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: isRTL ? '8px center' : 'calc(100% - 8px) center',
    paddingRight: isRTL ? '8px' : '24px',
    paddingLeft: isRTL ? '24px' : '8px',
    backgroundColor: '#ffffff',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  };

  const toggleGenre = (genre) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleRegion = (region) => {
    setRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  // הז'אנרים שיוצגו בחוץ - ראשיים + כל מה שנבחר
  const getDisplayedGenres = () => {
    const displayed = [...mainGenreOptions];
    genres.forEach(g => {
      if (!displayed.includes(g)) {
        displayed.push(g);
      }
    });
    return displayed;
  };

  // המדינות שיוצגו בחוץ
  const getDisplayedRegions = () => {
    const displayed = [...mainRegionOptions];
    regions.forEach(r => {
      if (!displayed.includes(r)) {
        displayed.push(r);
      }
    });
    return displayed;
  };

  // פונקציית עזר לבקשות עם timeout
  const fetchWithTimeout = async (url, options, timeout = SEARCH_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }
      throw error;
    }
  };

  // פונקציה לחיפוש שירים
  const handleSearch = async () => {
    // מניעת לחיצות כפולות
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    // שמירת הפרמטרים לחיפוש חוזר
    const searchParams = {
      tempoMin,
      tempoMax,
      key,
      scale,
      timeSignature,
      genres,
      regions,
      vocalType,
      yearMin,
      yearMax,
      artistName
    };
    setLastSearchParams(searchParams);
    
    try {
      // שלב 1: חיפוש בספוטיפיי
      let spotifyData;
      try {
        const spotifyResponse = await fetchWithTimeout('/api/spotify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            params: searchParams,
            excludeIds: []
          })
        });
        
        if (!spotifyResponse.ok) {
          throw new Error('SPOTIFY_ERROR');
        }
        
        spotifyData = await spotifyResponse.json();
      } catch (err) {
        if (err.message === 'TIMEOUT') {
          throw new Error('SPOTIFY_TIMEOUT');
        }
        throw new Error('SPOTIFY_ERROR');
      }
      
      if (!spotifyData.tracks || spotifyData.tracks.length === 0) {
        setError(language === 'he' 
          ? 'לא נמצאו שירים מתאימים לקריטריונים שבחרת. נסי לשנות חלק מהפרמטרים או להרחיב את הטווחים.' 
          : 'No songs match your criteria. Try changing some parameters or widening the ranges.');
        setIsLoading(false);
        return;
      }
      
      // שלב 2: חיפוש ביוטיוב (רק 15 ראשונים, השאר נשמרים)
      const tracksForYoutube = spotifyData.tracks.slice(0, 15);
      const tracksForLater = spotifyData.tracks.slice(15);
      
      let youtubeData;
      try {
        const youtubeResponse = await fetchWithTimeout('/api/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            songs: tracksForYoutube,
            targetCount: 10
          })
        });
        
        if (!youtubeResponse.ok) {
          throw new Error('YOUTUBE_ERROR');
        }
        
        youtubeData = await youtubeResponse.json();
      } catch (err) {
        if (err.message === 'TIMEOUT') {
          throw new Error('YOUTUBE_TIMEOUT');
        }
        throw new Error('YOUTUBE_ERROR');
      }
      
      if (!youtubeData.songs || youtubeData.songs.length === 0) {
        setError(language === 'he' 
          ? 'נמצאו שירים בספוטיפיי אבל לא הצלחנו למצוא אותם ביוטיוב. נסי חיפוש אחר.' 
          : 'Found songs on Spotify but could not find them on YouTube. Try a different search.');
        setIsLoading(false);
        return;
      }
      
      // הצלחה! שומרים את השירים הנוספים לסבב הבא
      const displayedIds = new Set(youtubeData.songs.map(s => s.id));
      const remainingTracks = [
        ...tracksForYoutube.filter(t => !displayedIds.has(t.id)), // שירים שלא נמצאו ביוטיוב
        ...tracksForLater // שירים שעוד לא חיפשנו
      ];
      
      setSongs(youtubeData.songs);
      setSearchedSongIds(displayedIds);
      setPendingSpotifyTracks(remainingTracks);
      setCurrentSongIndex(0);
      setShowResults(true);
      
    } catch (err) {
      console.error('Search error:', err);
      
      // הודעות שגיאה ספציפיות
      let errorMessage;
      switch (err.message) {
        case 'SPOTIFY_TIMEOUT':
          errorMessage = language === 'he' 
            ? 'החיפוש בספוטיפיי לקח יותר מדי זמן. בדקי את החיבור לאינטרנט ונסי שוב.' 
            : 'Spotify search timed out. Check your internet connection and try again.';
          break;
        case 'YOUTUBE_TIMEOUT':
          errorMessage = language === 'he' 
            ? 'החיפוש ביוטיוב לקח יותר מדי זמן. נסי שוב.' 
            : 'YouTube search timed out. Please try again.';
          break;
        case 'SPOTIFY_ERROR':
          errorMessage = language === 'he' 
            ? 'שגיאה בחיבור לספוטיפיי. נסי שוב מאוחר יותר.' 
            : 'Error connecting to Spotify. Please try again later.';
          break;
        case 'YOUTUBE_ERROR':
          errorMessage = language === 'he' 
            ? 'שגיאה בחיבור ליוטיוב. נסי שוב מאוחר יותר.' 
            : 'Error connecting to YouTube. Please try again later.';
          break;
        default:
          errorMessage = language === 'he' 
            ? 'משהו השתבש. נסי לרענן את הדף ולחפש שוב.' 
            : 'Something went wrong. Try refreshing the page and searching again.';
      }
      setError(errorMessage);
    }
    
    setIsLoading(false);
  };

  // חיפוש שירים אחרים (באותם פרמטרים)
  const handleSearchDifferent = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let tracksToSearch = [];
      
      // בדיקה אם יש שירים שמורים מספוטיפיי
      if (pendingSpotifyTracks.length > 0) {
        // יש שירים שמורים - משתמשים בהם
        tracksToSearch = pendingSpotifyTracks.slice(0, 15);
        const remainingPending = pendingSpotifyTracks.slice(15);
        setPendingSpotifyTracks(remainingPending);
      } else if (lastSearchParams) {
        // אין שירים שמורים - מבקשים חדשים מספוטיפיי
        let spotifyData;
        try {
          const spotifyResponse = await fetchWithTimeout('/api/spotify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              params: lastSearchParams,
              excludeIds: Array.from(searchedSongIds)
            })
          });
          
          if (!spotifyResponse.ok) {
            throw new Error('SPOTIFY_ERROR');
          }
          
          spotifyData = await spotifyResponse.json();
        } catch (err) {
          if (err.message === 'TIMEOUT') {
            throw new Error('TIMEOUT');
          }
          throw new Error('SPOTIFY_ERROR');
        }
        
        if (!spotifyData.tracks || spotifyData.tracks.length === 0) {
          setError(language === 'he' 
            ? 'לא נמצאו עוד שירים מתאימים. נסי לשנות את הפרמטרים לחיפוש חדש.' 
            : 'No more matching songs found. Try changing parameters for a new search.');
          setIsLoading(false);
          return;
        }
        
        tracksToSearch = spotifyData.tracks.slice(0, 15);
        setPendingSpotifyTracks(spotifyData.tracks.slice(15));
      } else {
        setError(language === 'he' 
          ? 'אין פרמטרים לחיפוש. בצעי חיפוש חדש.' 
          : 'No search parameters. Please do a new search.');
        setIsLoading(false);
        return;
      }
      
      // חיפוש ביוטיוב
      let youtubeData;
      try {
        const youtubeResponse = await fetchWithTimeout('/api/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            songs: tracksToSearch,
            targetCount: 10
          })
        });
        
        if (!youtubeResponse.ok) {
          throw new Error('YOUTUBE_ERROR');
        }
        
        youtubeData = await youtubeResponse.json();
      } catch (err) {
        if (err.message === 'TIMEOUT') {
          throw new Error('TIMEOUT');
        }
        throw new Error('YOUTUBE_ERROR');
      }
      
      if (!youtubeData.songs || youtubeData.songs.length === 0) {
        setError(language === 'he' 
          ? 'לא נמצאו עוד סרטונים ביוטיוב.' 
          : 'No more YouTube videos found.');
        setIsLoading(false);
        return;
      }
      
      // הצלחה!
      setSongs(youtubeData.songs);
      setSearchedSongIds(prev => new Set([...prev, ...youtubeData.songs.map(s => s.id)]));
      setCurrentSongIndex(0);
      
    } catch (err) {
      console.error('Search error:', err);
      
      let errorMessage;
      if (err.message === 'TIMEOUT') {
        errorMessage = language === 'he' 
          ? 'החיפוש לקח יותר מדי זמן. נסי שוב.' 
          : 'Search timed out. Please try again.';
      } else {
        errorMessage = language === 'he' 
          ? 'שגיאה בחיפוש. נסי שוב.' 
          : 'Search error. Please try again.';
      }
      setError(errorMessage);
    }
    
    setIsLoading(false);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setSearchedSongIds(new Set());
    setLastSearchParams(null);
    setError(null);
    setPendingSpotifyTracks([]);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-6" 
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ 
        fontFamily: isRTL ? 'Heebo, Arial, sans-serif' : 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #faf5f7 0%, #f0e6eb 50%, #e8dce3 100%)'
      }}
    >
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-5 relative">
          <button
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            className="absolute top-0 left-0 flex items-center gap-1 px-2.5 py-1 text-xs bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-gray-800"
          >
            <LanguageIcon />
            {language === 'he' ? 'EN' : 'עב'}
          </button>
          
          <h1 
            className="text-3xl mb-1 flex items-center justify-center gap-1"
            style={{ 
              color: primaryColor,
              fontFamily: isRTL ? 'Heebo, Arial, sans-serif' : 'system-ui, sans-serif',
              fontWeight: 900
            }}
          >
            <DrumstickLogo className="w-10 h-10" style={{ color: primaryColor }} />
            {language === 'he' ? 'בַּקצב' : 'Tempo'}
          </h1>
          <p className="text-gray-600 text-sm">
            {language === 'he' 
              ? 'חיפוש שירים לפי מאפיינים מוזיקליים' 
              : 'Search songs by musical attributes'}
          </p>
        </div>

        {/* Main Form Card */}
        <div 
          className="bg-white rounded-2xl shadow-lg p-5 space-y-5"
          style={{ boxShadow: '0 4px 20px rgba(108, 3, 45, 0.08)' }}
        >
          
          {/* Section 1: להתאמן על */}
          <section className="border-b border-gray-100 pb-4">
            <h2 
              className="text-base font-extrabold mb-3 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <SlidersIcon />
              {language === 'he' ? 'להתאמן על:' : 'Working on:'}
            </h2>
            
            <div className="space-y-2.5">
              {/* Tempo */}
              <div className="flex items-center gap-2">
                <label style={{ ...labelStyle, width: language === 'he' ? '90px' : '110px', flexShrink: 0 }}>
                  {language === 'he' ? 'מפעם (BPM)' : 'Tempo (BPM)'}
                </label>
                <input
                  type="text"
                  value={tempoMin}
                  onChange={(e) => setTempoMin(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inputStyle, width: '50px' }}
                />
                <span className="text-xs text-gray-400">
                  {language === 'he' ? 'עד' : 'to'}
                </span>
                <input
                  type="text"
                  value={tempoMax}
                  onChange={(e) => setTempoMax(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inputStyle, width: '50px' }}
                />
              </div>

              {/* Time Signature */}
              <div className="flex items-center gap-2">
                <label style={{ ...labelStyle, width: language === 'he' ? '90px' : '110px', flexShrink: 0 }}>
                  {language === 'he' ? 'משקל' : 'Time Signature'}
                </label>
                <select
                  value={timeSignature}
                  onChange={(e) => setTimeSignature(e.target.value)}
                  style={{ ...selectStyle, width: '70px' }}
                >
                  <option value=""></option>
                  {timeSignatures.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                </select>
              </div>

              {/* Key & Scale */}
              <div className="flex items-center gap-2">
                <label style={{ ...labelStyle, width: language === 'he' ? '90px' : '110px', flexShrink: 0 }}>
                  {language === 'he' ? 'מפתח' : 'Key'}
                </label>
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  style={{ ...selectStyle, width: '55px' }}
                >
                  <option value=""></option>
                  {keys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                
                <select
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  style={{ ...selectStyle, width: '70px' }}
                >
                  <option value=""></option>
                  {scales.map(s => (
                    <option key={s} value={s}>
                      {language === 'he' ? (s === 'Major' ? "מז'ור" : 'מינור') : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: רוצה לשמוע */}
          <section>
            <h2 
              className="text-base font-extrabold mb-3 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <MusicIcon />
              {language === 'he' ? 'רוצה לשמוע:' : 'Like to Listen:'}
            </h2>
            
            <div className="space-y-3">
              {/* Genres */}
              <div className="mb-4">
                <label className="block mb-2">
                  <span style={labelStyle}>
                    {language === 'he' ? 'סגנון מוזיקלי:' : 'Genre:'}
                  </span>
                  <span className="text-gray-400 text-sm mr-1">
                    {language === 'he' ? ' (אפשר כמה)' : ' (multiple)'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {getDisplayedGenres().map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
                        genres.includes(genre)
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={genres.includes(genre) ? { backgroundColor: primaryColor } : {}}
                    >
                      {language === 'he' ? (genreHebrew[genre] || genre) : genre}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowMoreGenres(true)}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    {language === 'he' ? 'עוד...' : 'More...'}
                  </button>
                </div>
              </div>

              {/* Regions */}
              <div className="mb-6">
                <label className="block mb-2">
                  <span style={labelStyle}>
                    {language === 'he' ? 'מאיפה:' : 'From:'}
                  </span>
                  <span className="text-gray-400 text-sm mr-1">
                    {language === 'he' ? ' (אפשר כמה)' : ' (multiple)'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {getDisplayedRegions().map(region => (
                    <button
                      key={region}
                      onClick={() => toggleRegion(region)}
                      className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
                        regions.includes(region)
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={regions.includes(region) ? { backgroundColor: primaryColor } : {}}
                    >
                      {language === 'en' ? countryTranslations[region] || region : region}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowMoreRegions(true)}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    {language === 'he' ? 'עוד...' : 'More...'}
                  </button>
                </div>
              </div>

              {/* Vocal Type */}
              <div className="flex items-center gap-2">
                <label style={{ ...labelStyle, width: '130px', flexShrink: 0 }}>
                  {language === 'he' ? 'שיר / אינסטרומנטלי' : 'Song / Instrumental'}
                </label>
                <select
                  value={vocalType}
                  onChange={(e) => setVocalType(e.target.value)}
                  style={{ ...selectStyle, width: '110px' }}
                >
                  <option value=""></option>
                  {(language === 'he' ? vocalTypesHe : vocalTypesEn).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Years */}
              <div className="flex items-center gap-2">
                <label style={{ ...labelStyle, width: '130px', flexShrink: 0 }}>
                  {language === 'he' ? 'שנת יציאה' : 'Release Year'}
                </label>
                <input
                  type="text"
                  value={yearMin}
                  onChange={(e) => setYearMin(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inputStyle, width: '55px' }}
                />
                <span className="text-xs text-gray-400">
                  {language === 'he' ? 'עד' : 'to'}
                </span>
                <input
                  type="text"
                  value={yearMax}
                  onChange={(e) => setYearMax(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inputStyle, width: '55px' }}
                />
              </div>

              {/* Artist Name */}
              <div className="flex items-center gap-2">
                <label style={{ ...labelStyle, width: '130px', flexShrink: 0 }}>
                  {language === 'he' ? 'שם אומן' : 'Artist'}
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: '120px' }}
                />
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Search Button with Loading Animation */}
          <div className="flex flex-col items-center pt-2 gap-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-8 py-2.5 text-white rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-70 shadow-md hover:shadow-lg flex items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading 
                ? (language === 'he' ? 'מחפש...' : 'Searching...') 
                : (language === 'he' ? 'שלוש ארבע - לעבודה!' : "Let's Play!")}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-3">
          {language === 'he' 
            ? 'חיפוש באמצעות Spotify API • נגינה ב-YouTube • נבנה ע"י le7.sign' 
            : 'Search via Spotify API • Play on YouTube • Built by le7.sign'}
        </p>
      </div>

      {/* More Genres Modal */}
      {showMoreGenres && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowMoreGenres(false)}
        >
          <div 
            className="bg-white rounded-2xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                {language === 'he' ? 'בחירת סגנונות' : 'Select Genres'}
              </h3>
              <button
                onClick={() => setShowMoreGenres(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {allGenreOptions.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-colors ${
                    genres.includes(genre)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={genres.includes(genre) ? { backgroundColor: primaryColor } : {}}
                >
                  {language === 'he' ? (genreHebrew[genre] || genre) : genre}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoreGenres(false)}
              className="w-24 mx-auto block text-white py-1.5 rounded-lg text-xs font-medium hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {language === 'he' ? 'סגור' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* More Regions Modal */}
      {showMoreRegions && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowMoreRegions(false)}
        >
          <div 
            className="bg-white rounded-2xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                {language === 'he' ? 'בחירת מדינות' : 'Select Countries'}
              </h3>
              <button
                onClick={() => setShowMoreRegions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {allRegionOptions.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-colors ${
                    regions.includes(region)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={regions.includes(region) ? { backgroundColor: primaryColor } : {}}
                >
                  {language === 'en' ? countryTranslations[region] || region : region}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoreRegions(false)}
              className="w-24 mx-auto block text-white py-1.5 rounded-lg text-xs font-medium hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {language === 'he' ? 'סגור' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div 
              className="p-3 text-white flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <h3 className="text-base font-bold flex items-center gap-2">
                <DrumstickLogo className="w-5 h-5" style={{ color: 'white' }} />
                {language === 'he' ? 'לנגן בַּקצב' : 'Play with Tempo'}
              </h3>
              <button
                onClick={handleCloseResults}
                className="text-white hover:opacity-80"
              >
                <XIcon />
              </button>
            </div>

            {/* YouTube Player - Compact */}
            <div className="bg-gray-900 p-2">
              {songs[currentSongIndex] && (
                <div className="flex items-center gap-3">
                  {/* Mini YouTube Player */}
                  <div className="w-28 h-20 flex-shrink-0 rounded overflow-hidden bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${songs[currentSongIndex].youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                      title="YouTube player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {/* Song Info */}
                  <div className="flex-1 min-w-0 text-white">
                    <p className="text-sm font-medium truncate">{songs[currentSongIndex].title}</p>
                    <p className="text-xs text-gray-400 truncate">{songs[currentSongIndex].artist}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'he' ? 'לחץ על הנגן להפעלה' : 'Click player to play'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Song List */}
            <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: '350px' }}>
              <div className="space-y-1.5">
                {songs.map((song, index) => (
                  <button
                    key={song.id}
                    onClick={() => setCurrentSongIndex(index)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                      currentSongIndex === index
                        ? 'bg-pink-50'
                        : 'hover:bg-gray-50'
                    }`}
                    style={currentSongIndex === index ? { 
                      borderRight: isRTL ? `3px solid ${primaryColor}` : 'none',
                      borderLeft: !isRTL ? `3px solid ${primaryColor}` : 'none'
                    } : {}}
                  >
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        currentSongIndex === index ? 'text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                      style={currentSongIndex === index ? { backgroundColor: primaryColor } : {}}
                    >
                      {currentSongIndex === index ? <PlayIcon /> : <span className="text-xs">{index + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-medium text-gray-800 truncate">{song.title}</p>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleSearchDifferent}
                disabled={isLoading}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all border-2 hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {isLoading 
                  ? (language === 'he' ? 'מחפש...' : 'Searching...')
                  : (language === 'he' ? 'שירים אחרים' : 'Different Songs')}
              </button>
              <button
                onClick={handleNewSearch}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {language === 'he' ? 'חיפוש חדש' : 'New Search'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
