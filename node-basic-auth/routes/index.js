const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// middleware to protect a route
function loginCheck() {
  return (req, res, next) => {
    // check if we have a logged in user
    if (req.session.user) {
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
  // to set a cookie yourself
  res.cookie('myCookie', 'hello from express')
  // access the cookie -> req.cookies
  console.log('this is the cookie: ', req.cookies)
  // clear the cookie on the client
  res.clearCookie('myCookie')
  const user = req.session.user
  res.render("profile", { user: user });
});

module.exports = router;
