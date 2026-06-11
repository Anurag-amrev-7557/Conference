const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeStartSeconds(url: string): number | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed);
    const startParam = parsed.searchParams.get('start') ?? parsed.searchParams.get('t');
    if (!startParam) return undefined;

    if (/^\d+$/.test(startParam)) {
      return Number.parseInt(startParam, 10);
    }

    const hours = startParam.match(/(\d+)h/)?.[1];
    const minutes = startParam.match(/(\d+)m/)?.[1];
    const seconds = startParam.match(/(\d+)s/)?.[1];
    const total =
      (hours ? Number.parseInt(hours, 10) * 3600 : 0) +
      (minutes ? Number.parseInt(minutes, 10) * 60 : 0) +
      (seconds ? Number.parseInt(seconds, 10) : 0);

    return total > 0 ? total : undefined;
  } catch {
    return undefined;
  }
}

export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch?.[1]) return embedMatch[1];

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch?.[1]) return shortMatch[1];

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.replace(/^www\./, '') === 'youtube.com') {
      const id = parsed.searchParams.get('v');
      if (id && YOUTUBE_ID_PATTERN.test(id)) return id;
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(id: string, autoplay = false, startSeconds?: number): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (autoplay) params.set('autoplay', '1');
  if (startSeconds && startSeconds > 0) {
    params.set('start', String(Math.floor(startSeconds)));
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}
