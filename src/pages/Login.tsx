import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate("/admin");
      });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        navigate("/admin");
      }
    } else {
      // Local fallback if Supabase not configured
      if (adminLogin(password)) {
        navigate("/admin");
      } else {
        setError("Invalid password. (Supabase not connected)");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-md mx-auto mt-20 px-4">
        <div className="bg-secondary p-8 rounded-lg border border-border">
          <h2 className="text-foreground text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            {supabase && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                className="w-full px-4 py-3 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded hover:bg-yellow-dark transition-colors"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
