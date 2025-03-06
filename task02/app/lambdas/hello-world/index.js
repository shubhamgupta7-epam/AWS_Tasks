exports.handler = async (event) => {
    const path = event.rawPath || event.path;
    const method = event.requestContext?.http?.method || event.httpMethod;

    if (path === "/hello" && method === "GET") {
        return {
            statusCode: 200,
            message: "Hello from Lambda"
        };
    } else {
        return {
            statusCode: 400,
            message : `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`
        }
    }
}
