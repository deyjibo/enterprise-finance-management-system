import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [rolesStatus, setRolesStatus] = useState({ admin: false, manager: false });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    try {
      const res = await API.get("/api/auth/roles-count");
      setRolesStatus({ admin: res.data.admin, manager: res.data.manager });

      if (!res.data.admin) setRole("admin");
      else if (!res.data.manager) setRole("manager");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");

    const name = role === "admin" ? "Admin User" : "Manager User";

    try {
      await API.post("/api/auth/register", { name, email, password, role });
      setMessage(`${role} registered successfully!`);
      await fetchRoles();
      setEmail(""); setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const styles = {
    page: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "url('https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1470&q=80') center/cover", fontFamily: "Arial,sans-serif" },
    card: { width: "350px", padding: "2rem", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
    heading: { textAlign: "center", marginBottom: "1.5rem", color: "#000" },
    inputContainer: { position: "relative", marginBottom: "1rem" },
    input: { width: "100%", padding: "0.9rem 2.5rem 0.9rem 0.9rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.5)", backgroundColor: "rgba(255,255,255,0.8)", color: "#000", fontSize: "1rem", outline: "none" },
    select: { width: "100%", padding: "0.9rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.5)", backgroundColor: "rgba(255,255,255,0.8)", marginBottom: "1rem", fontSize: "1rem" },
    eyeIcon: { position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#000", fontSize: "1.1rem" },
    button: { width: "100%", padding: "0.9rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" },
    loginButton: { width: "100%", padding: "0.9rem", backgroundColor: "#764ba2", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" },
    error: { marginBottom: "1rem", padding: "0.7rem", color: "#721c24", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "6px", textAlign: "center" },
    success: { marginBottom: "1rem", padding: "0.7rem", color: "#155724", backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "6px", textAlign: "center" }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Register</h2>
        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}
        <form onSubmit={handleRegister}>
          <div style={styles.inputContainer}>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={styles.input} required />
          </div>
          <div style={styles.inputContainer}>
            <input type={showPassword?"text":"password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={styles.input} required />
            <span style={styles.eyeIcon} onClick={()=>setShowPassword(!showPassword)}>{showPassword?"🙈":"👁️"}</span>
          </div>
          <select value={role} onChange={e=>setRole(e.target.value)} style={styles.select}>
            <option value="admin" disabled={rolesStatus.admin}>Admin {rolesStatus.admin?"(Already Registered)":""}</option>
            <option value="manager" disabled={rolesStatus.manager}>Manager {rolesStatus.manager?"(Already Registered)":""}</option>
          </select>
          <button type="submit" style={styles.button} disabled={rolesStatus.admin && rolesStatus.manager}>Register</button>
        </form>
        <button style={styles.loginButton} onClick={()=>navigate("/")}>Back to Login</button>
      </div>
    </div>
  );
}