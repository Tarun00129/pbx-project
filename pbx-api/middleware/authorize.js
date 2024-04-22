const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
    const authorization = req.headers['authorization'];
    if (authorization) {
        const token = authorization
					.replace("Bearer ", "")
					.replace("bearer ", "");
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            if (decoded) {
                return next();
            }
        } catch (e) {
           
                return res.status(400).send({ error: 'Token Expired', message: 'Authentication failed.' });
            
        }
    }else{
       
            return res.status(400).send({ error: 'Unauthorized', message: 'Authentication failed.' });
    
        
    }
}

 module.exports =  authorize;
// module.exports =   softphone_authorize;
