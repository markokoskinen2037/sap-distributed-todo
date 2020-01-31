const express = require('express')
const httpProxy = require('express-http-proxy')
const jwt = require('jsonwebtoken');
require('dotenv').config()
var cors = require('cors');
const logger = require('morgan');

let inProduction = process.env.NODE_ENV === "production"



const app = express()

const userServiceProxy = httpProxy(inProduction ? 'https://sap-user-ms.herokuapp.com' : "http://localhost:3002")
const todoServiceProxy = httpProxy(inProduction ? "https://sap-todo-ms.herokuapp.com" : "http://localhost:3001")



const validateToken = (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    let result;
    if (authorizationHeaader) {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const options = {
            expiresIn: '2d',
            issuer: 'sap-todo'
        };
        try {
            // verify makes sure that the token hasn't expired and has been issued by us
            result = jwt.verify(token, process.env.JWT_SECRET, options);

            // Let's pass back the decoded token to the request object
            req.decoded = result;
            // We call next to pass execution to the subsequent middleware
            next();
        } catch (err) {
            // Throw an error just in case anything goes wrong with verification
            console.log(err);

            throw new Error(err);
        }
    } else {
        result = {
            error: `Authentication error. Token required.`,
            status: 401
        };
        res.status(401).send(result);
    }
}




app.use(cors())
app.use(logger('dev'));



// Authentication
app.use((req, res, next) => {

    console.log(req.url)

    if (req.url === "/todos") {
        validateToken(req, res, next)
    } else {
        next()
    }



})

// PROXY REQUESTS ONCE THE TOKEN REQUEST TOKEN HAS BEEN AUTHORIZED:
app.post('/users*', (req, res, next) => {
    userServiceProxy(req, res, next)
})
app.get('/users*', (req, res, next) => {
    userServiceProxy(req, res, next)
})

app.get('/todos*', (req, res, next) => {
    todoServiceProxy(req, res, next)
})

app.post('/todos*', (req, res, next) => {
    todoServiceProxy(req, res, next)
})

const port = process.env.PORT || 3003
app.listen(port, () => console.log('api gateway started on port', port, inProduction))