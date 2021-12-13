const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
var user = "";

app.use(
	session({
		secret: "Our little secret",
		resave: false,
		saveUninitialized: false
	})
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
	"mongodb+srv://admin-noobie:Test123@cluster0.gkznc.mongodb.net/clientDB"
);

// mongoose.connect("mongodb://localhost:27017/clientDB");

const clientSchema = new mongoose.Schema({
	email: String,
	password: String,
	posts: Array,
	comments: Array
});

const postSchema = new mongoose.Schema({
	title: String,
	url: String,
	goal: String
});

const feedbackSchema = new mongoose.Schema({
	name: String,
	review: String
});

const projectSchema = new mongoose.Schema({
	projName: String,
	startMonth: String,
	startYear: Number,
	endMonth: String,
	endYear: Number,
	associate: String,
	projURL: String,
	description: String,
	owner: String
});

clientSchema.plugin(passportLocalMongoose);

const Client = mongoose.model("Client", clientSchema);
const Post = mongoose.model("Post", postSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const Project = mongoose.model("Project", projectSchema);

passport.use(Client.createStrategy());

passport.serializeUser(Client.serializeUser());
passport.deserializeUser(Client.deserializeUser());

app.get("/", (req, res) => {
	res.render("register");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/login");
});

app.get("/forgot", (req, res) => {
	res.render("forgot");
});

app.get("/newsletter", async (req, res) => {
	if (!req.isAuthenticated()) {
		res.redirect("/login");
	} else {
		console.log("Authed");
	}

	await res.render("newsletter", { user: req.user.username });
});

app.get("/clientcreation", async (req, res) => {
	if (!req.isAuthenticated()) {
		res.redirect("/login");
	} else {
		console.log("Authed");
	}

	await res.render("clientcreation", { user: req.user.username });
});

app.get("/clientsolution", (req, res) => {
	if (!req.isAuthenticated()) {
		res.redirect("/login");
	} else {
		console.log("Authed");
	}

	Post.find({}, async (err, postArr) => {
		if (postArr) {
			await res.render("clientsolution", {
				user: req.user.username,
				postArr: postArr
			});
		}
	});
});

app.get("/addproject", async (req, res) => {
	if (!req.isAuthenticated()) {
		res.redirect("/login");
	} else {
		console.log("Authed");
	}

	await res.render("addproject", { user: req.user.username });
});

app.get("/projectgo", async (req, res) => {
	if (!req.isAuthenticated()) {
		res.redirect("/login");
	} else {
		console.log("Authed");
	}
	await console.log(req.user.username);
	Project.find({}, async (err, foundArr) => {
		if (foundArr) {
			if (foundArr.length > 0) {
				await res.render("projectgo", {
					user: req.user.username,
					foundArr: foundArr
				});
			} else {
				res.render("noprojects");
			}
		}
	});
});

app.get("/myprojects", async (req, res) => {
	await console.log(req.user.username);
	Client.findOne({ username: req.user.username }, (err, foundUser) => {
		if (foundUser) {
			var array = foundUser.posts;
			console.log(array);
			if (array.length > 0) {
				res.render("myprojects", { proArr: array });
			} else {
				res.render("noprojects");
			}
		}
	});
});

app.get("/mycomments", async (req, res) => {
	await console.log(req.user.username);
	Client.findOne({ username: req.user.username }, (err, foundUser) => {
		if (foundUser) {
			var array = foundUser.comments;
			console.log(array);
			if (array.length > 0) {
				res.render("mycomments", { comArr: array });
			} else {
				res.render("nocomments");
			}
		}
	});
});

app.post("/addproject", async (req, res) => {
	await console.log(req.user.username);
	Client.findOneAndUpdate(
		{ _id: req.user._id },
		{
			$push: {
				posts: {
					projName: req.body.projName,
					startMonth: req.body.startMonth,
					startYear: req.body.startYear,
					endMonth: req.body.endMonth,
					endYear: req.body.endYear,
					associate: req.body.associate,
					projURL: req.body.url,
					description: req.body.description
				}
			}
		},
		(err) => {
			if (!err) console.log("Successfully pushed to array");
		}
	);

	const project = new Project({
		projName: req.body.projName,
		startMonth: req.body.startMonth,
		startYear: req.body.startYear,
		endMonth: req.body.endMonth,
		endYear: req.body.endYear,
		associate: req.body.associate,
		projURL: req.body.url,
		description: req.body.description,
		owner: req.user.username
	});

	project.save((err) => {
		if (err) console.log(err);
		else {
			console.log("successfully saved the project");
			res.redirect("/projectgo");
		}
	});
});

app.post("/", (req, res) => {
	Client.register({ username: req.body.username }, req.body.password, (err) => {
		setTimeout(() => {
			if (!err) {
				passport.authenticate("local")(req, res, () => {
					res.redirect("/newsletter");
				});
			} else {
				console.log(err);
			}
		}, 100);
	});
});

app.post("/login", (req, res) => {
	const client = new Client({
		username: req.body.username,
		password: req.body.password
	});

	req.login(client, (err) => {
		if (!err) {
			passport.authenticate("local")(req, res, () => {
				res.redirect("/newsletter");
			});
		} else {
			console.log(err);
		}
	});
});

app.post("/clientcreation", (req, res) => {
	const newPost = new Post({
		title: req.body.title,
		url: req.body.url,
		goal: req.body.goal
	});
	newPost.save((err) => {
		if (err) console.log(err);
		else {
			console.log("Successfully saved the post");
			res.redirect("/clientsolution");
		}
	});
});

app.post("/delete", (req, res) => {
	Client.findOneAndDelete({ username: user }, (err) => {
		if (!err) {
			console.log("Successfully deleted the account");
			res.redirect("/");
		}
	});
});

app.post("/feedback", (req, res) => {
	const feedback = new Feedback({
		name: req.body.name,
		review: req.body.review
	});

	feedback.save((err) => {
		if (err) console.log(err);
		else {
			console.log("successfully saved the feedback");
			res.redirect("/newsletter");
		}
	});
});

app.post("/comments", async (req, res) => {
	console.log(req.body);
	await Client.findOneAndUpdate(
		{ username: req.body.user },
		{
			$push: {
				comments: {
					from: req.user.username,
					title: req.body.title,
					comments: req.body.comments
				}
			}
		},
		(err) => {
			if (!err) {
				console.log("Successfully pushed to array");
				res.send({ flag: 1 });
			} else {
				res.send({ flag: 0 });
			}
		}
	);
});

app.listen(process.env.PORT || 3000, () =>
	console.log("Server started on port")
);
