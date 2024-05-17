const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
    const tokenHeader = req.get('Authorization')
    if (tokenHeader) {
        try {
            const token = tokenHeader.split(' ')[1]
            decodedToken = jwt.verify(token, 'supersupersecretsign')
            if (!decodedToken) {
                req.isAuth = false
                return next()
            } else {
                req.userId = decodedToken.userId
                req.isAuth = true
                return next()
            }  
        }
        catch(err) {
            err.statusCode = 500
            throw err
        }
    } else {
        req.isAuth = false
        return next()
    }
}

// const handleUnathenticatedError = () => {
//     // const err = new Error()
//     // err.statusCode = 401
//     // err.message = 'Unauthenticated User'
//     // throw err
//     req.isAuth = false
//     return next()

// }