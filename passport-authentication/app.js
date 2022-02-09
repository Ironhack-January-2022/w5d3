// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const projectName = "passport-authentication";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with IronLauncher`;

// session configuration

const session = require('express-session')
const MongoStore = require('connect-mongo')

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		cookie: { maxAge: 1000 * 60 * 60 * 24 },
		resave: true,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI
		})
	})
)
// end of session configuration


// passport config

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User.model')

passport.serializeUser((user, done) => {
	done(null, user._id)
})
passport.deserializeUser((id, done) => {
	User.findById(id)
		.then(userFromDB => {
			done(null, userFromDB)
		})
		.catch(err => {
			done(err)
		})
})

passport.use(
	new LocalStrategy((username, password, done) => {
		// this logic is executed on login
		User.findOne({ username: username })
			.then(userFromDB => {
				if (userFromDB === null) {
					// there is no user with this username
					done(null, false, { message: 'Wrong Credentials' })
				} else {
					done(null, userFromDB)
				}
			})
	})
)

app.use(passport.initialize())
app.use(passport.session())

// end of passport config

// passport github-login config

const GithubStrategy = require('passport-github').Strategy

passport.use(new GithubStrategy({
	clientID: process.env.GITHUB_CLIENT_ID,
	clientSecret: process.env.GITHUB_CLIENT_SECRET,
	callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
},
	(accessToken, refreshToken, profile, done) => {
		console.log(profile)
		User.findOne({ githubId: profile.id })
			.then(userFromDB => {
				if (userFromDB !== null) {
					// pass the user to passport
					done(null, userFromDB)
				} else {
					// this is the first time they are using our app
					// we create an account
					User.create({ githubId: profile.id, username: profile.username, avatar: profile._json.avatar_url })
						.then(createdUser => {
							done(null, createdUser)
						})
				}
			})
			.catch(err => done(err))
	})
)

// end of passport github-login config



// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const auth = require("./routes/auth");
app.use("/", auth);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
