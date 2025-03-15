import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-gray-800 text-white p-4 flex justify-center space-x-4">
    <Link to="/user/login" className="hover:underline">User Login</Link>
    <Link to="/user/signup" className="hover:underline">User Signup</Link>
    <Link to="/company/login" className="hover:underline">Company Login</Link>
    <Link to="/company/signup" className="hover:underline">Company Signup</Link>
    <Link to="/admin/login" className="hover:underline">Admin Login</Link>
    <Link to="/admin/signup" className="hover:underline">Admin Signup</Link>
  </nav>
);

export default Navbar;