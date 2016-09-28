import createPage from "./routes/createpage";
import createpageRoute from "./routes/createpage";
import deletepageRoute from "./routes/deletepage";
import editpageRoute from "./routes/editpage";
import getpagesRoute from "./routes/getpages";
import getprofiledataRoute from "./routes/getprofiledata";
import getsubjectsRoute from "./routes/getsubjects";
import loginRoute from "./routes/login";
import logoutRoute from "./routes/logout";
import notfoundRoute from "./routes/notfound";
import profileRoute from "./routes/profile";
import revertRoute from "./routes/revert";
import saveblocksRoute from "./routes/saveblocks";
import saveprofileRoute from "./routes/saveprofile";
import signupRoute from "./routes/signup";
import startRoute from "./routes/start";
import uploadmediaRoute from "./routes/uploadmedia";

import { Express } from "express";
 
// module is by default a function that takes in an app and configures its routes to various handlers
export default function setupRoutes(app: Express) {
    /* routes */
    app.get("/", startRoute);
    app.post("/signup", signupRoute);
    app.post("/login", loginRoute);
    app.post("/logout", logoutRoute);
    app.post("/createpage", createpageRoute);
    app.post("/deletepage", deletepageRoute);
    app.post("/getpages", getpagesRoute); /// breaks REST ??
    app.post("/getsubjects", getsubjectsRoute);
    app.get("/editpage*", editpageRoute);
    app.post("/saveblocks", saveblocksRoute);
    app.post("/uploadmedia*", uploadmediaRoute); /// breaks REST ?? uses get query with post method
    app.get("/profile", profileRoute);
    app.post("/saveprofile", saveprofileRoute);
    app.post("/getprofiledata", getprofiledataRoute);
    app.post("/revert", revertRoute);
    app.all("*", notfoundRoute);
}
