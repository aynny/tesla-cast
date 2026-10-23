export type Playback = { paused: boolean; track_window: { current_track: { name: string; artists: { name: string }[] } } };
export type Player = {
  connect(): Promise<boolean>; disconnect(): void; activateElement(): Promise<void>;
  togglePlay(): Promise<void>; nextTrack(): Promise<void>; previousTrack(): Promise<void>;
  addListener(event: 'ready' | 'not_ready', listener: (data: { device_id: string }) => void): boolean;
  addListener(event: 'player_state_changed', listener: (data: Playback | null) => void): boolean;
  addListener(event: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error' | 'autoplay_failed', listener: (data: { message: string }) => void): boolean;
};
type SDK = { Player: new (options: { name: string; volume: number; getOAuthToken: (cb: (token: string) => void) => void }) => Player };
declare global { interface Window { Spotify?: SDK; onSpotifyWebPlaybackSDKReady?: () => void } }
let sdk: Promise<SDK> | null = null;
export function loadSpotifySdk(): Promise<SDK> {
  if (window.Spotify) return Promise.resolve(window.Spotify);
  if (sdk) return sdk;
  sdk = new Promise<SDK>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => { script.remove(); reject(new Error('Spotifyプレーヤーの読み込みがタイムアウトしました。ページを再読み込みしてください。')); }, 20000);
    window.onSpotifyWebPlaybackSDKReady = () => { clearTimeout(timer); if (window.Spotify) resolve(window.Spotify); };
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Spotifyプレーヤーを読み込めませんでした。')); };
    document.head.appendChild(script);
  }).catch(error => { sdk = null; throw error; });
  return sdk;
}
