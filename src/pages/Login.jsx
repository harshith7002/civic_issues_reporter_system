import "./Login.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    localStorage.setItem(
      "js_user",
      JSON.stringify({ name: name.trim(), mobile: phone })
    )

    navigate("/report")
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Citizen Login</h2>

        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            maxLength={10}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            required
          />

          {error && <p className="error-msg">{error}</p>}

          <button type="submit">Continue</button>
        </form>
      </div>
    </div>
  )
}

export default Login
