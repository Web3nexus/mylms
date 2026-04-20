import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize, 
  AlertCircle, 
  RotateCcw, 
  RotateCw,
  Settings
} from 'lucide-react';

const Player: any = ReactPlayer;

interface SecureMediaViewerProps {
  url: string;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onEnded?: () => void;
}

const SecureMediaViewer: React.FC<SecureMediaViewerProps> = ({ url, onProgress, onEnded }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(false);
  
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => setPlaying(!playing);
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => setSeeking(true);
  
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value));
  };

  const handleProgress = (state: any) => {
    if (!seeking) {
      setPlayed(state.played);
      onProgress?.(state);
    }
  };

  const fastForward = () => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(currentTime + 10);
  };

  const rewind = () => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(Math.max(0, currentTime - 10));
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl border border-border-soft transition-all hover:shadow-mylms-purple/20"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Context Menu Shield & Click-to-Play Area */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer" 
        onClick={togglePlay}
      ></div>

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 border-2 border-mylms-rose/20 text-center px-10 z-20">
          <AlertCircle className="w-12 h-12 text-mylms-rose mb-4 animate-pulse" />
          <h3 className="text-white font-black uppercase tracking-tighter text-lg mb-2">Transmission Interrupted</h3>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            The media stream could not be established. Please verify your connection or contact administrative support.
          </p>
        </div>
      ) : (
        <Player
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onProgress={handleProgress}
          onDuration={(d) => setDuration(d)}
          onEnded={onEnded}
          onError={() => setError(true)}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true,
                onContextMenu: (e: any) => e.preventDefault(),
              }
            },
            youtube: {
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              disablekb: 1,
            }
          } as any}
        />
      )}

      {/* Custom Control Bar */}
      <div className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-500 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        
        {/* Progress Slider */}
        <div className="flex items-center gap-4 mb-4 group/progress">
          <span className="text-[10px] font-mono font-black text-white/70 w-10 text-right">{formatTime(played * duration)}</span>
          <div className="flex-1 relative h-1.5 flex items-center">
             <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                className="absolute inset-0 w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-mylms-rose focus:outline-none z-10"
             />
             <div 
               className="absolute left-0 h-1 bg-mylms-rose rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(255,87,131,0.5)]"
               style={{ width: `${played * 100}%` }}
             ></div>
          </div>
          <span className="text-[10px] font-mono font-black text-white/70 w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-mylms-rose transition-all transform active:scale-90">
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <div className="flex items-center gap-4">
              <button onClick={rewind} className="text-white/70 hover:text-white transition-all transform active:-rotate-45">
                <RotateCcw size={18} />
              </button>
              <button onClick={fastForward} className="text-white/70 hover:text-white transition-all transform active:rotate-45">
                <RotateCw size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 group/volume ml-2">
              <button onClick={() => setMuted(!muted)} className="text-white/70 hover:text-white transition-all">
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-white/70 hover:text-white transition-all">
              <Settings size={18} />
            </button>
            <button className="text-white/70 hover:text-white transition-all" onClick={() => playerRef.current?.getInternalPlayer()?.requestFullscreen?.()}>
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Security Overlay (Subtle Brand) */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none opacity-40 group-hover:opacity-100 transition-all">
        <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
          <div className="w-2 h-2 bg-mylms-rose rounded-full animate-pulse shadow-[0_0_10px_#ff5783]"></div>
          <span className="text-[8px] font-black text-white uppercase tracking-[0.3em] font-serif italic">MyLMS Secure Content Viewer</span>
        </div>
      </div>

      {/* Central Play Overlay */}
      {!playing && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-20 h-20 bg-mylms-rose/20 backdrop-blur-md rounded-full flex items-center justify-center border border-mylms-rose/30 animate-in zoom-in duration-300">
             <Play size={32} className="text-white ml-1 fill-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureMediaViewer;
