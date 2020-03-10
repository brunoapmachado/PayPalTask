const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const app = express();

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(bodyParser.urlencoded ({extended: false}))

app.use(bodyParser.json())

app.use('/', require('./routes'))

//app.listen(3000, () => console.log('Rondando na Porta 3000'))

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Umbler listening on port %s', port);
});