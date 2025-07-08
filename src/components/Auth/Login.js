"use client"

import { useState, useContext } from "react"
import axios from "../api/axios"
import { useHistory } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const { setUser } = useContext(AuthContext)
  const history = useHistory()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.get(`/users?email=${form.email}&password=${form.password}`)
      console.log(res.data)
      if (res.data.length > 0) {
        setUser(res.data[0])
        history.push("/tasks")
      } else {
        setError("Invalid credentials")
      }
    } catch (err) {
      setError("Login failed")
      console.error(err)
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="login-input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #F5F5DC 0%, #FFF8DC 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-form {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(139, 69, 19, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .login-form h2 {
          text-align: center;
          color: #8B4513;
          margin-bottom: 30px;
          font-size: 2rem;
          font-weight: 300;
        }

        .login-input {
          width: 100%;
          padding: 15px 20px;
          margin-bottom: 20px;
          border: 2px solid #DDB892;
          border-radius: 50px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .login-input:focus {
          outline: none;
          border-color: #A0522D;
          box-shadow: 0 0 0 3px rgba(160, 82, 45, 0.1);
        }

        .login-button {
          width: 100%;
          padding: 15px 25px;
          background: linear-gradient(135deg, #D2691E 0%, #CD853F 100%);
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(210, 105, 30, 0.3);
        }

        .error-message {
          color: #D2691E;
          text-align: center;
          margin-bottom: 20px;
          padding: 10px;
          background: #FFF3CD;
          border-radius: 10px;
          border: 1px solid #DDB892;
        }
      `}</style>
    </div>
  )
}

export default Login
