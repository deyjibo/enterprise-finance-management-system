import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);

      const role = res.data.role;
      if (role === "admin") navigate("/admin");
      else if (role === "manager") navigate("/manager");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Credentials");
    }
  };

  const styles = {
    page: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundImage:
        "url('https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1470&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      width: "350px",
      padding: "2rem",
      borderRadius: "12px",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    },
    heading: { textAlign: "center", marginBottom: "1.5rem", color: "#000" },
    inputContainer: { position: "relative", marginBottom: "1rem" },
    input: {
      width: "100%",
      padding: "0.9rem 2.5rem 0.9rem 0.9rem",
      borderRadius: "8px",
      border: "1px solid rgba(0, 0, 0, 0.5)",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      color: "#000",
      fontSize: "1rem",
      outline: "none",
    },
    eyeIcon: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#000",
      fontSize: "1.1rem",
    },
    button: {
      width: "100%",
      padding: "0.9rem",
      backgroundColor: "#764ba2",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      cursor: "pointer",
      marginTop: "0.5rem",
    },
    registerButton: {
      width: "100%",
      padding: "0.9rem",
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      cursor: "pointer",
      marginTop: "0.5rem",
    },
    error: {
      marginBottom: "1rem",
      padding: "0.7rem",
      color: "#721c24",
      backgroundColor: "#f8d7da",
      border: "1px solid #f5c6cb",
      borderRadius: "6px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={styles.inputContainer}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        {/* Register button */}
        <button
          style={styles.registerButton}
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}