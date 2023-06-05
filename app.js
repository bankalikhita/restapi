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
    let createuserquery = `insert into user (username,name,password,gender,location) values('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      await db.run(createuserquery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const logindetails = request.body;
  const { username, password } = logindetails;
  const checkuser = `select * from user WHERE username='${username}';`;
  let dbuser = await db.get(checkuser);
  if (dbuser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const pwdmatch = await bcrypt.compare(password, dbuser.password);
    if (pwdmatch === true) {
      response.send("Login success!");
      response.status(400);
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const changepwd = request.body;
  const { username, oldPassword, newPassword } = changepwd;
  const getuser = `select * from user where username='${username}';`;
  const userdet = await db.get(getuser);

  if (userdet === undefined) {
    response.status(400);
    response.send("User not registered");
  } else {
    const pwdmatch = await bcrypt.compare(oldPassword, userdet.password);
    if (pwdmatch === false) {
      response.status(400);
      response.send("Invalid current password");
    } else {
      if (newPassword.length < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        let newhashedPassword = await bcrypt.hash(newPassword, 10);
        const updatepwd = `update user set password='${newhashedPassword}' where username='${username}';`;
        await db.run(updatepwd);
        response.send("Password updated");
        response.status(200);
      }
    }
  }
});
module.exports = app;
