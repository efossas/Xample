import { journal, loadPage } from "../utilities";

/*
    Function: notfound

    Page 404, page not found response.

    Parameters:

        request - http request
        response - http response

    Returns:

        nothing - *
*/
export default function notfound(request, response) {
    /* 404 page not found */
    response.status(404);
    loadPage(request, response, "<script>pageError('notfound');</script>");
}
