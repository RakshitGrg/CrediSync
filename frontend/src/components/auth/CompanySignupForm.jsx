import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";

const CompanySignupForm = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    registrationNo: "",
    businessAddress: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear errors when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/api/auth/company/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // Save token to localStorage
        localStorage.setItem("email", formData.email);
        navigate("/company/dashboard");
      } else {
        const data = await response.json();
        setErrors({ submit: data.message || "Signup failed" });
      }
    } catch (error) {
      setErrors({ submit: "Network error occurred" });
    }
  };

  return (
    <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white/90 backdrop-blur-lg py-6 px-4 shadow-xl rounded-3xl sm:px-10">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Company Name"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            placeholder="Enter your company name"
          />

          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Phone"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="Enter your phone number"
          />

          <Input
            label="Registration No."
            id="registrationNo"
            name="registrationNo"
            value={formData.registrationNo}
            onChange={handleChange}
            error={errors.registrationNo}
            placeholder="Enter your registration number"
          />

          <Input
            label="Business Address"
            id="businessAddress"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            error={errors.businessAddress}
            placeholder="Enter your business address"
          />

          <PasswordInput
            label="Password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
          />

          {errors.submit && (
            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
          )}

          <Button type="submit">Sign Up</Button>
        </form>
      </div>
    </div>
  );
};

export default CompanySignupForm;