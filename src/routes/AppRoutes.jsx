import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import ReportIssue from "../pages/ReportIssue";
import MapView from "../pages/MapView";
import Admin from "../pages/Admin";
import TrackComplaint from "../pages/TrackComplaint";
import Success from "../pages/Success";

function AppRoutes(){

const user = JSON.parse(localStorage.getItem("js_user") || "null");

return(

<Routes>

<Route path="/" element={<Home />} />

<Route path="/login" element={<Login />} />

<Route
path="/report"
element={user ? <ReportIssue /> : <Navigate to="/login" />}
/>

<Route path="/map" element={<MapView />} />

<Route path="/admin" element={<Admin />} />

<Route path="/track" element={<TrackComplaint />} />

<Route path="/success/:id" element={<Success />} />

</Routes>

)

}

export default AppRoutes;