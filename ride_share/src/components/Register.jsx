import { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    cab_id: "",
    dob: "",
    location: "",
  });

  const [open, setOpen] = useState(false); // Snackbar open state
  const [message, setMessage] = useState(""); // Snackbar message

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get("role");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let token = null;
    console.log("Before sending to register", data);

    axios
      .post(`http://localhost:9000/register`, data)
      .then((res) => {
        console.log("Register", res.data.data._id);
        token = res.data.token;
        const _id = res.data.data._id;

        setData((prevData) => ({
          ...prevData,
          _id: _id,
        }));

        if (token) {
          localStorage.setItem("token", token);
          setMessage("Registration successful!");
          setOpen(true);

          // If successful, return a promise to chain the second request
          console.log("Before Sending :", data);
        } else {
          throw new Error("No token received.");
        }
      })
      .then(() => {
        return axios.post(`http://3.111.198.198:5000/getJWT`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((res) => {
        console.log("Tanush: ", res.data.total_server_access_token);
        console.log("Data: ", data);

        if (role === "driver") {
          return axios.post(
            `http://3.111.198.198:5050/driver/addDriver`,
            data,
            {
              headers: {
                Authorization: `Bearer ${res.data.total_server_access_token}`,
              },
            }
          );
        } else {
          // rider
          return axios.post(`http://3.111.198.198:5050/rider/addRider`, data, {
            headers: {
              Authorization: `Bearer ${res.data.total_server_access_token}`,
            },
          });
        }
      })
      .then((res) => {
        console.log(res);
        if (res) {
          console.log("Driver added:", res.data);
        }
        // Delay navigation to allow the message to display
        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((err) => {
        console.error("Error during registration or driver addition:", err);
        setMessage("Error occurred. Please try again.");
        setOpen(true);
      });
  };

  const handleClose = () => {
    setOpen(false); // Close Snackbar
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <AppRegistrationIcon />
        </Avatar>
        <Typography component="h1" variant="h5" color={"black"}>
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={data.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={data.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={data.password}
            onChange={handleChange}
          />
          {role === "driver" && (
            <>
              <Box sx={{ mb: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="cab_id"
                  label="RC Book"
                  name="cab_id"
                  autoComplete="cab_id"
                  value={data.cab_id}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="dob"
                  label="Date Of Birth"
                  name="dob"
                  autoComplete="dob"
                  value={data.dob}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="location"
                  label="Location"
                  name="location"
                  autoComplete="loc"
                  value={data.location}
                  onChange={handleChange}
                />
              </Box>
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          <Typography variant="body2" align="center" color={"black"}>
            Already have an account?{" "}
            <Link href="/" variant="body2">
              Log in here
            </Link>
          </Typography>
        </Box>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
