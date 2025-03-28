// import React, { useState } from "react";

// const LoanCreation = () => {
//     const [loanData, setLoanData] = useState({
//         amount: "",
//         interestRate: "",
//         term: "",
//         borrower: "",
//     });

//     // Handle input change
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setLoanData((prevData) => ({
//             ...prevData,
//             [name]: value,
//         }));
//     };

//     // Handle form submission
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log("Loan Created:", loanData);
//         alert("Loan Created Successfully!");
        
//         // Here you can send data to the backend using fetch or axios
//     };

//     return (
//         <div style={styles.container}>
//             <h2 style={styles.heading}>Create a New Loan</h2>
//             <form onSubmit={handleSubmit} style={styles.form}>
//                 {/* Loan Amount */}
//                 <label style={styles.label}>Loan Amount ($)</label>
//                 <input
//                     type="number"
//                     name="amount"
//                     value={loanData.amount}
//                     onChange={handleChange}
//                     required
//                     style={styles.input}
//                 />

//                 {/* Interest Rate */}
//                 <label style={styles.label}>Interest Rate (%)</label>
//                 <input
//                     type="number"
//                     name="interestRate"
//                     value={loanData.interestRate}
//                     onChange={handleChange}
//                     required
//                     style={styles.input}
//                 />

//                 {/* Loan Term */}
//                 <label style={styles.label}>Loan Term (Months)</label>
//                 <input
//                     type="number"
//                     name="term"
//                     value={loanData.term}
//                     onChange={handleChange}
//                     required
//                     style={styles.input}
//                 />

//                 {/* Borrower Name */}
//                 <label style={styles.label}>Borrower Name</label>
//                 <input
//                     type="text"
//                     name="borrower"
//                     value={loanData.borrower}
//                     onChange={handleChange}
//                     required
//                     style={styles.input}
//                 />

//                 {/* Submit Button */}
//                 <button type="submit" style={styles.button}>
//                     Create Loan
//                 </button>
//             </form>
//         </div>
//     );
// };

// // Inline styles
// const styles = {
//     container: {
//         maxWidth: "400px",
//         margin: "auto",
//         padding: "20px",
//         borderRadius: "10px",
//         boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//         backgroundColor: "#fff",
//         textAlign: "center",
//     },
//     heading: {
//         fontSize: "20px",
//         marginBottom: "10px",
//     },
//     form: {
//         display: "flex",
//         flexDirection: "column",
//     },
//     label: {
//         marginBottom: "5px",
//         fontSize: "14px",
//         textAlign: "left",
//     },
//     input: {
//         padding: "8px",
//         marginBottom: "10px",
//         borderRadius: "5px",
//         border: "1px solid #ccc",
//     },
//     button: {
//         padding: "10px",
//         backgroundColor: "#007bff",
//         color: "#fff",
//         border: "none",
//         borderRadius: "5px",
//         cursor: "pointer",
//         fontSize: "16px",
//     },
// };

// export default LoanCreation;



import React, { useState } from "react";
import { DollarSign, Percent, Calendar, User } from "lucide-react";

const LoanCreation = () => {
  const [loanData, setLoanData] = useState({
    amount: "",
    interestRate: "",
    term: "",
  });

 // const [userEmail, setUserEmail] = useState("");

  
  // Extract user email from localStorage when the component mounts
  // useEffect(() => {
  //   const email = localStorage.getItem("email");
  //   if (email) {
  //     setUserEmail(email);
  //   }
  // }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoanData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log("Loan Created:", loanData);
  //   alert("Loan Created Successfully!");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("email");
    const loanDetails = {
      ...loanData,
      email: userEmail, // Include user email in the request payload
    };
    console.log(loanDetails);

    try {
      const response = await fetch("http://localhost:5001/createLoan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanDetails),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Loan Created Successfully!");
      } else {
        alert("Failed to create loan. Please try again.");
      }
    } catch (error) {
      console.error("Error creating loan:", error);
      alert("An error occurred. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-8">
          Create a New Loan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Loan Amount ($)
            </label>
            <input
              type="number"
              name="amount"
              value={loanData.amount}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter loan amount"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Percent className="w-4 h-4 mr-2 text-green-600" />
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              value={loanData.interestRate}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter interest rate"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              Loan Term (Months)
            </label>
            <input
              type="number"
              name="term"
              value={loanData.term}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter loan term"
            />
          </div>

          {/* <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <User className="w-4 h-4 mr-2 text-green-600" />
              Borrower Name
            </label>
            <input
              type="text"
              name="borrower"
              value={loanData.borrower}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Enter borrower name"
            />
          </div> */}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Create Loan
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoanCreation;
