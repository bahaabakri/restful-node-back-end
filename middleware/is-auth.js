const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
    const tokenHeader = req.get('Authorization')
    if (tokenHeader) {
        try {
            const token = tokenHeader.split(' ')[1]
            decodedToken = jwt.verify(token, 'supersupersecretsign')
            if (!decodedToken) {
                handleUnathenticatedError()
            } else {
                req.userId = decodedToken.userId
                next()
            }
        }
        catch(err) {
            err.statusCode = 500
            throw err
        }
    } else {
        handleUnathenticatedError()
    }
}

const handleUnathenticatedError = () => {
    const err = new Error()
    err.statusCode = 401
    err.message = 'Unauthenticated User'
    throw err
}