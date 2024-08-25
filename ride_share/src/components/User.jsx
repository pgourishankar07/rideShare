import { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { Link } from "react-router-dom";

const User = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform login logic here
    console.log("Email:", email, "Password:", password);
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
          <PersonIcon />
        </Avatar>
        <Typography component="h1" variant="h5" color={"black"}>
          User
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            LogIn
          </Button>
          <Typography variant="body2" align="center" color={"black"}>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Don't have an account?{" "}
            <Link to="/register?role=rider" variant="body2">
              Register as Rider
            </Link>
          </Typography>
          <Typography variant="body2" align="center" color={"black"}>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Don't have an account?{" "}
            <Link to="/register?role=driver" variant="body2">
              Register as Driver
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default User;
