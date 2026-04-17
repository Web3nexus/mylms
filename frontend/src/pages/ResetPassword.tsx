import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import client from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    password: "",
    password_confirmation: "",
  });
  const token = searchParams.get("token") || "";

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      // No token in URL — redirect to forgot password
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await client.post("/auth/reset-password", { ...form, token });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-mylms-purple rounded-2xl flex items-center justify-center shadow-xl mb-6">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif font-black text-mylms-purple uppercase tracking-tight">
            Set New Password
          </h1>
          <p className="text-sm text-text-secondary mt-3 font-medium">
            Create a strong, secure password for your account.
          </p>
        </div>

        <div className="bg-white border border-border-soft rounded-2xl shadow-xl p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-mylms-purple" />

          {done ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={36} className="text-green-600" />
              </div>
              <h2 className="text-xl font-black text-text-main uppercase tracking-tight mb-3">
                Password Updated!
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Your password has been reset successfully. Redirecting you to login…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mylms-purple/30 focus:border-mylms-purple transition-all"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reset-password"
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-12 py-3 border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mylms-purple/30 focus:border-mylms-purple transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-mylms-purple transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reset-password-confirm"
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password_confirmation}
                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-3 border border-border-soft rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mylms-purple/30 focus:border-mylms-purple transition-all"
                  />
                </div>
              </div>

              <button
                id="reset-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-mylms-rose text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-[#A00E26] transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Updating Password..." : "Reset My Password"}
              </button>

              <div className="text-center pt-2">
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
