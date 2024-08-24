import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate("/admin"); // Navigate to /admin when Admin button is clicked
  };

  const handleUserClick = () => {
    navigate("/user"); // Navigate to /admin when Admin button is clicked
  };

  return (
    <>
      <button style={{ margin: "20px" }} onClick={handleAdminClick}>
        Admin
      </button>
      <button onClick={handleUserClick}>User</button>
    </>
  );
};

export default Login;
