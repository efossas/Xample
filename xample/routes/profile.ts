import { journal, loadPage } from "../utilities";

/*
    Function: profile

    Grabs profile information and returns it to the front-end to display the profile page.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function profile(request, response) {
    const __function = "profile";

    /* grab the user's id */
    const uid = request.session.uid;

    if (typeof uid === "undefined") {
        loadPage(request, response, "<script>pageProfile('noprofileloggedout');</script>");
    } else {

        const qry = "SELECT username,email,phone,autosave,defaulttext FROM Users WHERE uid=" + uid;

        pool.getConnection(function(err, connection) {
            if (err) {
                journal(true, 221, err, uid, __line, __function, __filename);
            }

            connection.query(qry, function(err, rows, fields) {
                if (err) {
                    loadPage(request, response, "<script>pageProfile('err');</script>");
                    journal(true, 200, err, uid, __line, __function, __filename);
                } else {
                    const data = {};

                    data["username"] = rows[0].username;
                    data["email"] = rows[0].email;
                    data["phone"] = rows[0].phone;
                    data["autosave"] = rows[0].autosave;
                    data["defaulttext"] = rows[0].defaulttext;

                    const profiledata = JSON.stringify(data);

                    loadPage(request, response, "<script>pageProfile('" + profiledata + "');</script>");
                    journal(false, 0, "", uid, __line, __function, __filename);
                }
            });
            connection.release();
        });
    }
}
