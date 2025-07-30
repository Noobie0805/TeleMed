import React, { useEffect, useRef, useState } from 'react';
import './VideoCallModule.css';

function VideoCallModule() {
  const [showJitsi, setShowJitsi] = useState(false);
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    if (!showJitsi) return;
    // Clean up any previous Jitsi instance
    if (window.jitsiApi) {
      window.jitsiApi.dispose();
    }
    // Dynamically load the Jitsi Meet script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      window.jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: 'telemed-demo-room',
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: 500,
        configOverwrite: {},
        interfaceConfigOverwrite: {},
      });
    };
    document.body.appendChild(script);
    // Cleanup on unmount or when showJitsi changes
    return () => {
      if (window.jitsiApi) {
        window.jitsiApi.dispose();
      }
      document.body.removeChild(script);
    };
  }, [showJitsi]);

  return (
    <section className="video-call-module">
      <h2>Live Video Consultation</h2>
      {!showJitsi ? (
        <button className="start-video-call-btn" onClick={() => setShowJitsi(true)}>
          Start Video Call
        </button>
      ) : (
        <div ref={jitsiContainerRef} className="jitsi-meet-container" />
      )}
    </section>
  );
}

export default VideoCallModule; 