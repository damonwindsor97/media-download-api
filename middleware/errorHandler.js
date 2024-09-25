
class CustomError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode
    }
}

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'UNKNOWN_ERROR';
    
    res.status(statusCode).json({
        success: false,
        error: {
        message: err.message,
        code: errorCode
        }
    });
}

module.exports = {CustomError, errorHandler}