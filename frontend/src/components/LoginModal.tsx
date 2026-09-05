import React, { useState } from 'react';
import { verifyPasscode } from '../api';

interface LoginModalProps {
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await verifyPasscode(passcode.trim());
      if (result.valid) {
        onSuccess();
      } else {
        setErrorMessage(result.error || 'Incorrect passcode. Please try again.');
      }
    } catch {
      setErrorMessage('Could not connect to the authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090f]/90 backdrop-blur-xl animate-fade-in">
      {/* Glow Effect */}
      <div className="absolute w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Lock Card */}
      <div className="relative w-full max-w-md bg-[#12121e] border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/80 space-y-6 text-center">
        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-600/30">
          🔐
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Restricted Access
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            This deployment is passcode-protected to safeguard Groq LLM & Qdrant vector database limits.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium animate-shake">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoFocus
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter master passcode..."
              className="w-full bg-[#171726] border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs transition-colors p-1"
              title={showPassword ? 'Hide passcode' : 'Show passcode'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Unlock Application</span>
                <span className="text-base">→</span>
              </>
            )}
          </button>
        </form>

        {/* Notice */}
        <p className="text-[11px] text-gray-500">
          Saved on this device once authenticated.
        </p>
      </div>
    </div>
  );
};
