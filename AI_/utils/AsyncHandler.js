export const AsyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};


// this is a higher-order function that wraps asynchronous Express route handlers to catch errors and pass them to the next middleware.