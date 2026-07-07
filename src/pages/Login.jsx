import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-b from-[#1e5a99] to-[#0f3966] text-white relative overflow-hidden">
        <div className="flex items-center gap-2">
          <img
            src="https://media.base44.com/images/public/6a4d446aeae59d6815f530f1/2de38b6f3_ROKAKAMI_720-04.png"
            alt="Rocakami"
            className="w-40 h-auto mix-blend-screen"
          />
        </div>
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-white/90">One app. Everything connected.</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-5 font-heading">
            Everything your team needs — one click away.
          </h1>
          <p className="text-lg text-white/80 leading-relaxed font-body mb-6">
            Manage projects, clients, SOPs, documents, and team operations from a single, unified portal. No more scattered tools or lost context — just one powerful workspace built for how Rocakami delivers.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/70 font-body">
            <a href="https://www.rocakami.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              www.rocakami.com
            </a>
          </div>
        </div>
        <p className="text-sm text-white/60">© {new Date().getFullYear()} Rocakami — Architects of Digital Flow</p>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center bg-[#fcfcfd] px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block rounded-xl bg-[#0f3966] px-6 py-4">
              <img
                src="https://media.base44.com/images/public/6a4d446aeae59d6815f530f1/2de38b6f3_ROKAKAMI_720-04.png"
                alt="Rocakami"
                className="w-32 h-auto mx-auto mix-blend-screen"
              />
            </div>
          </div>

          {/* Login Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-8 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground font-heading">Welcome</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your portal.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-gradient-to-b from-[#1e5a99] to-[#0f3966] hover:from-[#1a4d85] hover:to-[#0d3155]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 text-sm font-medium border-[#cccccc]"
              onClick={handleGoogle}
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Sign in with Google
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Demo admin: admin@rocakami.local / Admin123!
          </p>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}