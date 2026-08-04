// Search for music online using multiple APIs
export async function searchOnlineMusic(query) {
  try {
    // Try multiple Invidious instances for better reliability
    const instances = [
      'https://vid.puffyan.us',
      'https://invidious.snopyta.org',
      'https://yewtu.be'
    ];

    for (const instance of instances) {
      try {
        const response = await fetch(
          `${instance}/api/v1/search?q=${encodeURIComponent(query + ' audio')}&type=video`,
          { timeout: 5000 }
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        const results = data.slice(0, 15).map(video => ({
          id: video.videoId,
          title: video.title,
          artist: video.author || 'Unknown Artist',
          duration: video.lengthSeconds,
          thumbnail: video.videoThumbnails?.[0]?.url || 
                     `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
          source: 'youtube',
          viewCount: video.viewCount,
          published: video.publishedText,
          streamUrl: `/api/public/stream-online/${video.videoId}`,
          playUrl: `/api/public/play-online/${video.videoId}`
        }));
        
        return results;
      } catch (error) {
        console.log(`Failed to fetch from ${instance}, trying next...`);
        continue;
      }
    }
    
    // Fallback: return empty array if all instances fail
    console.error('All Invidious instances failed');
    return [];
  } catch (error) {
    console.error('Music search error:', error);
    return [];
  }
}

// Get stream URL for online music with multiple fallbacks
export async function getOnlineStreamUrl(videoId) {
  try {
    const instances = [
      'https://vid.puffyan.us',
      'https://invidious.snopyta.org',
      'https://yewtu.be'
    ];

    for (const instance of instances) {
      try {
        const response = await fetch(`${instance}/api/v1/videos/${videoId}`, { timeout: 5000 });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // Priority: audio-only formats
        const audioFormats = data.adaptiveFormats?.filter(f => 
          f.type?.includes('audio')
        ).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        
        if (audioFormats && audioFormats.length > 0) {
          return audioFormats[0].url;
        }
        
        // Fallback to regular formats
        if (data.formatStreams && data.formatStreams.length > 0) {
          return data.formatStreams[0].url;
        }
      } catch (error) {
        console.log(`Failed to get stream from ${instance}, trying next...`);
        continue;
      }
    }
    
    console.error('All instances failed for video:', videoId);
    return null;
  } catch (error) {
    console.error('Stream URL error:', error);
    return null;
  }
}
