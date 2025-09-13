
// Register new user
const RegisterUser = async (req, res) => {
    try {

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
            },
            token: req.user.token
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error registering user", error: err.message });
    }
};

// Login user
const LogInUser = async (req, res) => {
    try {
      const user = {
        id: req.user.id,
        name: req.user.name, 
        email: req.user.email,
        token: req.user.token
      };
  
      res.status(200).json({
        success: true,
        message: "Login successfully",
        user: { id: user.id, email: user.email, name: user.name },
        token: user.token
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error logging in user", error: err.message });
    }
  };
  
  module.exports = { RegisterUser, LogInUser };