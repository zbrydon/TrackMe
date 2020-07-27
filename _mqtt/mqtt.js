const mqtt = require('mqtt');
const express = require('express');

const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
    next();
});

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on('connect', () => {
    console.log('mqtt connected');
});

app.post('/send-command', (req, res) => {
    const { deviceID, command } = req.body;
    const topic = `/219203655/command/${deviceID}`;
    client.publish(topic, command, () => {
        if (err == true) {
            return res.send(err);
        }
        else {
            return res.json({
                success: true,
                message: 'Command Sent'
            });
        }
    });
});

app.listen(port, () => {
    console.log(`listening on port  ${port}`);
});