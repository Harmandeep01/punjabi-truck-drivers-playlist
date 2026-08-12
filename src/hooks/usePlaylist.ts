import { useState, useEffect, useCallback, useRef } from 'react';
import { Track, PlaylistManifestItem } from '../types';
import { GET_BASE_URL } from '../utils/config';

const DEFAULT_FALLBACK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'G.T. Road (Highway Anthem)',
    artist: 'Surinder Shinda',
    album: 'Truck Driver Classics',
    artwork: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    duration: 215,
  },
  {
    id: '2',
    title: 'Truck Driver Flow',
    artist: 'Kuldip Manak',
    album: 'Roadside Dhaba Beats',
    artwork: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-10781.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-10781.mp3',
    duration: 184,
  },
  {
    id: '3',
    title: 'Majhail Highway Drive',
    artist: 'AP Dhillon & Gurinder Gill',
    album: 'Overnight Freight',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    artUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=hip-hop-rock-beat-118000.mp3',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=hip-hop-rock-beat-118000.mp3',
    duration: 208,
  },
];

export function usePlaylist() {
  const [masterTracks, setMasterTracks] = useState<Track[]>([]);
  const [activeTracks, setActiveTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  // Manifest Playlists
  const [playlists, setPlaylists] = useState<PlaylistManifestItem[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState<boolean>(true);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);

  // Active Playlist Metadata
  const [activePlaylistId, setActivePlaylistId] = useState<string>('master');
  const [activePlaylistName, setActivePlaylistName] = useState<string>('Master Library');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [source, setSource] = useState<'remote' | 'fallback'>('remote');

  const masterTracksRef = useRef<Track[]>([]);
  useEffect(() => {
    masterTracksRef.current = masterTracks;
  }, [masterTracks]);

  const normalizeTrack = (raw: any, index: number): Track => {
    const rawArtist = raw.artist;
    const artistDisplay = Array.isArray(rawArtist)
      ? rawArtist.join(', ')
      : typeof rawArtist === 'string' && rawArtist.trim()
      ? rawArtist
      : raw.singer || 'Punjabi Artist';

    const art =
      raw.artUrl ||
      raw.artwork ||
      raw.art ||
      raw.cover ||
      raw.image ||
      DEFAULT_FALLBACK_TRACKS[index % DEFAULT_FALLBACK_TRACKS.length].artwork;
    const audio =
      raw.audioUrl ||
      raw.url ||
      raw.src ||
      DEFAULT_FALLBACK_TRACKS[index % DEFAULT_FALLBACK_TRACKS.length].url;

    return {
      id: raw.id ? String(raw.id) : `track-${index + 1}`,
      title: raw.title || raw.name || `Track ${index + 1}`,
      artist: artistDisplay,
      album: raw.album || raw.playlist || 'Punjabi Highway Playlist',
      artwork: art,
      artUrl: art,
      url: audio,
      audioUrl: audio,
      duration: raw.duration ? Number(raw.duration) : 200,
    };
  };

  // 1. Fetch Master Library (data/tracks.json)
  const fetchMasterTracks = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    }

    const baseUrl = GET_BASE_URL();
    const url = `${baseUrl}/data/tracks.json`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json') || contentType.includes('text/plain')) {
          const data = await res.json();
          let rawList: any[] = [];

          if (Array.isArray(data)) {
            rawList = data;
          } else if (data && Array.isArray(data.tracks)) {
            rawList = data.tracks;
          } else if (data && typeof data === 'object') {
            const possibleArray = Object.values(data).find((val) => Array.isArray(val));
            if (possibleArray) rawList = possibleArray as any[];
          }

          if (rawList.length > 0) {
            const parsed = rawList.map((item, idx) => normalizeTrack(item, idx));
            setMasterTracks(parsed);
            setSource('remote');

            if (isInitial) {
              setActiveTracks(parsed);
              const randomIdx = Math.floor(Math.random() * parsed.length);
              setCurrentTrackIndex(randomIdx);
            }

            setLoading(false);
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Master tracks fetch error:', err);
    }

    setMasterTracks(DEFAULT_FALLBACK_TRACKS);
    if (isInitial) {
      setActiveTracks(DEFAULT_FALLBACK_TRACKS);
      const randomFallbackIdx = Math.floor(Math.random() * DEFAULT_FALLBACK_TRACKS.length);
      setCurrentTrackIndex(randomFallbackIdx);
    }
    setSource('fallback');
    setLoading(false);
    return DEFAULT_FALLBACK_TRACKS;
  }, []);

  // 2. Fetch Playlists Manifest (data/playlists.json)
  const fetchPlaylistsManifest = useCallback(async () => {
    setPlaylistsLoading(true);
    setPlaylistsError(null);

    const baseUrl = GET_BASE_URL();
    const url = `${baseUrl}/data/playlists.json`;

    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';

      if (res.ok && !contentType.includes('text/html')) {
        const text = await res.text();
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          const data = JSON.parse(text);
          const parsedManifest: PlaylistManifestItem[] = [];

          const parseItem = (item: any) => {
            if (typeof item === 'string') {
              parsedManifest.push({ id: item, name: item });
            } else if (item && typeof item === 'object') {
              const id = String(item.id || item.slug || item.key || item.name);
              const name = String(item.name || item.title || id);
              parsedManifest.push({
                id,
                name,
                description: item.description,
                file: item.file || item.path,
                trackCount: item.trackCount,
                updatedAt: item.updatedAt,
              });
            }
          };

          if (Array.isArray(data)) {
            data.forEach(parseItem);
          } else if (data && typeof data === 'object') {
            if (Array.isArray(data.playlists)) {
              data.playlists.forEach(parseItem);
            } else {
              Object.entries(data).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  parsedManifest.push({ id: key, name: val });
                } else if (val && typeof val === 'object') {
                  const itemObj = val as any;
                  parsedManifest.push({
                    id: itemObj.id || key,
                    name: itemObj.name || itemObj.title || key,
                    description: itemObj.description,
                    file: itemObj.file || itemObj.path,
                    trackCount: itemObj.trackCount,
                    updatedAt: itemObj.updatedAt,
                  });
                }
              });
            }
          }

          if (parsedManifest.length > 0) {
            setPlaylists(parsedManifest);
            setPlaylistsLoading(false);
            return;
          }
        }
      }
    } catch {
      // Manifest not found at data/playlists.json
    }

    // Direct check for kuldeep-manak playlist
    try {
      const kmUrl = `${baseUrl}/data/playlists/kuldeep-manak.json`;
      const kmRes = await fetch(kmUrl);
      if (kmRes.ok) {
        const contentType = kmRes.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          const text = await kmRes.text();
          if (text.trim().startsWith('{')) {
            const kmData = JSON.parse(text);
            const playlistId = kmData.id || 'kuldeep-manak';
            const rawName = kmData.name || 'Kuldeep Manak';
            const playlistName = rawName.toLowerCase().includes('kuldeep') || rawName.toLowerCase().includes('manak') ? 'Kuldeep Manak' : rawName;
            setPlaylists([{ id: playlistId, name: playlistName, file: 'data/playlists/kuldeep-manak.json' }]);
            setPlaylistsLoading(false);
            return;
          }
        }
      }
    } catch {
      // Ignore
    }

    setPlaylists([]);
    setPlaylistsError(null);
    setPlaylistsLoading(false);
  }, []);

  useEffect(() => {
    fetchMasterTracks(true);
    fetchPlaylistsManifest();
  }, [fetchMasterTracks, fetchPlaylistsManifest]);

  // Activate & Play a specific playlist and optional track
  const playPlaylistAndTrack = useCallback(
    async (
      playlistId: string,
      trackId?: string,
      customTracks?: Track[],
      customName?: string
    ) => {
      let resolvedTracks = customTracks;
      let resolvedName = customName;

      if (!resolvedTracks || resolvedTracks.length === 0) {
        if (!playlistId || playlistId === 'master' || playlistId === 'default') {
          resolvedTracks = masterTracksRef.current;
          resolvedName = 'Master Library';
        } else {
          const baseUrl = GET_BASE_URL();
          const targetManifest = playlists.find((p) => p.id === playlistId);
          let path = `${baseUrl}/data/playlists/${playlistId}.json`;
          if (targetManifest?.file) {
            path = targetManifest.file.startsWith('http')
              ? targetManifest.file
              : `${baseUrl}/${targetManifest.file.replace(/^\/+/, '')}`;
          }

          try {
            const res = await fetch(path);
            if (res.ok) {
              const contentType = res.headers.get('content-type') || '';
              if (!contentType.includes('text/html')) {
                const data = await res.json();
                const rawName = data.name || targetManifest?.name || playlistId;
                resolvedName = rawName.toLowerCase().includes('kuldeep') || rawName.toLowerCase().includes('manak') ? 'Kuldeep Manak' : rawName;
                const refs = Array.isArray(data) ? data : data.tracks || [];
                const cleanId = (s: string | number) => String(s).trim().replace(/^0+/, '');
                const masters = masterTracksRef.current;
                const resList: Track[] = [];

                refs.forEach((item: any, idx: number) => {
                  if (item && typeof item === 'object' && (item.audioUrl || item.url || item.title)) {
                    resList.push(normalizeTrack(item, idx));
                    return;
                  }
                  const tid = typeof item === 'string' ? item : item?.id ? String(item.id) : null;
                  if (tid) {
                    const match = masters.find((m) => cleanId(m.id) === cleanId(tid));
                    if (match) {
                      resList.push(match);
                      return;
                    }
                  }
                });

                resolvedTracks = resList.length > 0 ? resList : masters;
              }
            }
          } catch (e) {
            console.warn(`Failed to load playlist ${playlistId}:`, e);
          }
        }
      }

      if (!resolvedTracks || resolvedTracks.length === 0) {
        resolvedTracks = masterTracksRef.current;
        resolvedName = 'Master Library';
      }

      setActiveTracks(resolvedTracks);
      setActivePlaylistId(playlistId || 'master');
      setActivePlaylistName(resolvedName || 'Master Library');

      let targetIndex = 0;
      if (trackId) {
        const foundIdx = resolvedTracks.findIndex((t) => String(t.id) === String(trackId));
        if (foundIdx !== -1) {
          targetIndex = foundIdx;
        }
      }
      setCurrentTrackIndex(targetIndex);
    },
    [playlists]
  );

  // Requirement 3: Automatically move to the next playlist in sequence when repeat is off
  const playNextPlaylist = useCallback(async () => {
    const allPlaylistsList = [
      { id: 'master', name: 'Master Library' },
      ...playlists,
    ];

    const currentIdx = allPlaylistsList.findIndex((p) => p.id === activePlaylistId);
    const nextIdx = (currentIdx + 1) % allPlaylistsList.length;
    const nextPl = allPlaylistsList[nextIdx];

    await playPlaylistAndTrack(nextPl.id);
  }, [playlists, activePlaylistId, playPlaylistAndTrack]);

  const currentTrack = activeTracks[currentTrackIndex] || null;

  const selectTrack = (index: number) => {
    if (index >= 0 && index < activeTracks.length) {
      setCurrentTrackIndex(index);
    }
  };

  const selectTrackById = (id: string) => {
    const idx = activeTracks.findIndex((t) => String(t.id) === String(id));
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    }
  };

  const filteredTracks = activeTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const refetchAll = () => {
    fetchMasterTracks(false);
    fetchPlaylistsManifest();
  };

  return {
    tracks: activeTracks,
    masterTracks,
    activeTracks,
    filteredTracks,
    currentTrack,
    currentTrackIndex,
    loading,
    error,
    playlists,
    playlistsLoading,
    playlistsError,
    activePlaylistId,
    activePlaylistName,
    searchQuery,
    setSearchQuery,
    source,
    selectTrack,
    selectTrackById,
    playPlaylistAndTrack,
    playNextPlaylist,
    refetchPlaylist: refetchAll,
  };
}
