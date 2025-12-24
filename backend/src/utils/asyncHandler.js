const AsyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}
export { AsyncHandler };


// this is a higher-order function that wraps asynchronous Express route handlers to catch errors and pass them to the next middleware.