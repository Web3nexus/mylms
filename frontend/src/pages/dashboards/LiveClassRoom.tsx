import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, ShieldAlert, ArrowLeft, Terminal, Server } from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function LiveClassRoom() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  
  // This is a placeholder for Option B (LiveKit Integration)
  // We cannot render the LiveKit components until the user installs the server.

  return (
    <div className="min-h-screen bg-offwhite py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-mylms-purple mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <div className="bg-white rounded-[2.5rem] border border-border-soft shadow-xl p-10 md:p-16 text-center">
          <div className="w-24 h-24 bg-mylms-purple/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Server size={48} className="text-mylms-purple" />
          </div>
          
          <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase leading-none mb-4">
            Live Server Configuration Required
          </h1>
          <p className="text-gray-500 font-medium mb-12 max-w-2xl mx-auto">
            You selected <strong>Option B (Self-Hosted Lightweight Media Server)</strong>. To enable native WebRTC video streaming directly inside the LMS, you must deploy a LiveKit server and install the frontend SDK.
          </p>

          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-left space-y-8">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                <span className="bg-mylms-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">1</span>
                Frontend Installation
              </h3>
              <p className="text-xs text-gray-500 mb-3 font-medium">Run this command in your React frontend directory to install the LiveKit SDK:</p>
              <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                <Terminal size={16} className="text-gray-500" />
                <code className="text-green-400 text-xs font-mono">npm install livekit-client @livekit/components-react</code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                <span className="bg-mylms-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">2</span>
                Backend Installation
              </h3>
              <p className="text-xs text-gray-500 mb-3 font-medium">Run this command in your Laravel backend directory to install the LiveKit server SDK (to generate tokens):</p>
              <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                <Terminal size={16} className="text-gray-500" />
                <code className="text-green-400 text-xs font-mono">composer require livekit/server-sdk-php</code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                <span className="bg-mylms-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">3</span>
                Deploy LiveKit Server
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                You must deploy the open-source LiveKit server on your hosting provider (via Docker). Once deployed, add your LiveKit API Key and Secret to the Laravel <code className="text-mylms-purple bg-mylms-purple/10 px-1 rounded">.env</code> file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
