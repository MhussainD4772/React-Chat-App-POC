import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createOfficer } from "../api";

function Login(): JSX.Element {
  const [officerId, setOfficerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!officerId.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to create the officer (will succeed if new, or return 409 if exists)
      try {
        await createOfficer(officerId.trim());
      } catch (err: any) {
        // If officer already exists (409), that's fine - proceed to login
        if (err.message && err.message.includes("already exists")) {
          // Officer exists, proceed
        } else {
          throw err;
        }
      }

      // Navigate to dashboard
      navigate("/dashboard", { state: { officerId: officerId.trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Officer Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="officerId">Officer ID</label>
            <input
              id="officerId"
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              placeholder="Enter officer ID"
              required
              disabled={isLoading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
