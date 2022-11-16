const jwt = require ('jsonwebtoken');

function authUser(req, res, next) {
    const token = req.cookies.token;
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });    
}

function authAdmin(req, res, next) {
    const token = req.cookies.token;
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(401);
        req.user = user;
        if (user.userRoles.includes('Admin')) {
            next();
        } else {
            console.log("You don't have permission to access the data on this page");
            return res.sendStatus(403);
        }
    });    
}

function authSuperAdmin(req, res, next) {
    const token = req.cookies.token;
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        if (user.userRoles.includes('superAdmin')) {
            next();
        } else {
            console.log("You don't have permission to access the data on this page");
            return res.sendStatus(403);
        }
    });    
}

module.exports = { authUser, authAdmin, authSuperAdmin };
