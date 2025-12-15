import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginCustomer, ChatResponse } from "../api";

function Login(): JSX.Element {
  const [customerId, setCustomerId] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const chatData: ChatResponse = await loginCustomer(
        customerId,
        officerId || undefined
      );
      navigate("/chat", { state: { chatData } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Customer Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerId">Customer ID</label>
            <input
              id="customerId"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter customer ID"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="officerId">Officer ID (optional)</label>
            <input
              id="officerId"
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              placeholder="Enter officer ID"
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
