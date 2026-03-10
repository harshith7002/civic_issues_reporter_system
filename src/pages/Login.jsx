import "./Login.css";
import { useState } from "react";

function Login(){

const [name,setName] = useState("")
const [phone,setPhone] = useState("")

const submit=(e)=>{
e.preventDefault()
alert("Login successful")
}

return(

<div className="login-page">

<div className="login-box">

<h2>Citizen Login</h2>

<form onSubmit={submit}>

<input
type="text"
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
type="tel"
placeholder="Phone Number"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>

<button>Continue</button>

</form>

</div>

</div>

)

}

export default Login