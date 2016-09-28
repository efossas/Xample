import { journal } from "../utilities";

/*
    Function: logout

    Ajax, handles the log out routine.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function logout(request, response) {
    const __function = "logout";

    /* store the uid for journaling */
    let uid = request.session.uid;

    /* easy enough, regardless of whether the user was logged in or not, destroying the session will ensure log out */
    request.session.destroy();

    response.end("loggedout");
    journal(false, 0, "", uid, __line, __function, __filename);
    uid = "";
}
