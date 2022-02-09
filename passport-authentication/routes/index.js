const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// middleware to protect a route
function loginCheck() {
  return (req, res, next) => {
    // check if we have a logged in user
    if (req.user) {
      // the user making the request is logged in
      // user can proceed
      next()
    } else {
      // user is not logged in
      res.redirect('/login')
    }
  }
}

router.get("/profile", loginCheck(), (req, res, next) => {
  // in node basic auth: req.session.user
  // in passport: req.user
  const user = req.user
  res.render("profile", { user: user });
});

module.exports = router;

