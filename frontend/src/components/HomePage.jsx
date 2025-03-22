import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import LoanCreation from "./LoanCreation"; // The component to show for /lender

const HomePage = () => {
    return (
        // <Router>
        //     <div style={{ display: "flex" }}>
        //         {/* Sidebar Navbar */}
        //         <Navbar />

        //         {/* Main Content Area with Routes */}
        //         {/* <div style={{ flex: 1, padding: "20px" }}>
        //             <Routes>
        //                 <Route path="/user/lender" element={<LoanCreation />} />
        //             </Routes>
        //         </div> */}
        //     </div>
        // </Router>
        <div style={{ display: "flex" }}>
            <Navbar />
           
        </div>
    );
};

export default HomePage;
