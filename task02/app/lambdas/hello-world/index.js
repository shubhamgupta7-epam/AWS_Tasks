exports.handler = async (event) => {
    const path = event.rawPath || event.path;
    const method = event.requestContext?.http?.method || event.httpMethod;

    if (path === "/hello" && method === "GET") {
        return {
            statusCode: 200,
            body: JSON.stringify("Hello from Lambda!"),
        };
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad Request",
                error: `Invalid path: ${path} or method: ${method}`,
            }),
        };
    }
};
