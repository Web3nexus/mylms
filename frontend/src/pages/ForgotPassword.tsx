import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import client from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await client.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-mylms-purple rounded-2xl flex items-center justify-center shadow-xl mb-6">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-text-secondary mt-3 font-medium">
            Enter your account email and we'll send a secure reset link.
          </p>
        </div>

        <div className="bg-white border border-border-soft rounded-2xl shadow-xl p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-mylms-purple" />

          {sent ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={36} className="text-green-600" />
              </div>
              <h2 className="text-xl font-black text-text-main uppercase tracking-tight mb-3">
                Reset Link Sent
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-8">
                If an account exists for <strong>{email}</strong>, a reset link has been sent.
                Please check your inbox (and spam folder).
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-mylms-purple hover:text-mylms-rose transition-colors"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mylms-purple/30 focus:border-mylms-purple transition-all"
                  />
                </div>
              </div>

              <button
                id="forgot-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-mylms-purple text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-[#001D4A] transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending Reset Link..." : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-secondary hover:text-mylms-purple transition-colors"
                >
                  <ArrowLeft size={12} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
