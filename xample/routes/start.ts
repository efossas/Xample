import { journal, loadPage } from "../utilities";

/*
    Function: start

    Page Index, detects if session exists and either loads landing or user's home page.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function start(request, response) {
    const __function = "start";

    /* detect is the user is logged in by checking for a session */
    if (request.session.uid) {
        /* user is logged in, display home page */
        loadPage(request, response, "<script>pageHome();</script>");
        journal(false, 0, "", request.session.uid, __line, __function, __filename);
    } else {
        /* user is not logged in, display landing page */
        loadPage(request, response, "<script>pageLanding();</script>");
        journal(false, 0, "", 0, __line, __function, __filename);
    }
}
