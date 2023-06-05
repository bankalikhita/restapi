const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "userData.db");
let db = null;
const initializedb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializedb();

app.post("/register", async (request, response) => {
  const checkuserdetails = request.body;
  const { username, name, password, gender, location } = checkuserdetails;
  let hashedPassword = await bcrypt.hash(password, 10);
  const checkuserquery = `select * from user WHERE username='${username}';`;
  let dbuser = await db.get(checkuserquery);
  if (dbuser === undefined) {
    let createuserquery = `insert into user (username,name,password,gender,location) values('$(username)','$(name)','$(hashedPassword)','$(gender)','$(location)');`;
    if (password.length < 5) {
      response.send("Password is too short");
      response.status(400);
    } else {
      await db.run(createuserquery);
      response.send("User created succesfully");
      response.status(200);
    }
  } else {
    response.send("User already exists");
    response.status(400);
  }
});
module.exports = app;
