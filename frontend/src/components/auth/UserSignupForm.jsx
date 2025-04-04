import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";

const UserSignupForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
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
      const response = await fetch("http://localhost:5001/api/auth/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // Save token to localStorage
        localStorage.setItem("email", formData.email);
        navigate("/user/profile");
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
            label="Full Name"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Enter your full name"
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

export default UserSignupForm;