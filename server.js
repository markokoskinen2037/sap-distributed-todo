const express = require('express')
const httpProxy = require('express-http-proxy')
const app = express()

const userServiceProxy = httpProxy('https://sap-user-ms.herokuapp.com')
const todoServiceProxy = httpProxy("https://sap-todo-ms.herokuapp.com")

// Authentication
app.use((req, res, next) => {

    let token
    try {
        token = req.headers.authorization.split(" ")[1].trim()
        next()
    } catch (e) {
        res.send("Token missing / wrong format / expired / error / smth")
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

app.listen(process.env.PORT || 3003, () => console.log('api gateway started'))