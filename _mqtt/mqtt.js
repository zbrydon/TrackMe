const mqtt = require('mqtt');
const express = require('express');
const mongoose = require('mongoose');
const Device = require('./models/device');
const randomCoordinates = require('random-coordinates');
const rand = require('random-int');

const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb+srv://zbrydon:zbrydon@sit209.dss4j.mongodb.net/sit209", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static('public'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
    next();
});

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on('connect', () => {
    console.log('mqtt connected');
    client.subscribe('/sensorData');
});

client.on('message', (topic, message) => {
    if (topic == '/sensorData') {
        const data = JSON.parse(message);
        Device.findOne({ "name": data.deviceId }, (err, device) => {
            if (err) {
                console.log(err);
            }

            const { sensorData } = device;
            const { ts, loc, temp } = data;

            sensorData.push({ ts, loc, temp });
            device.sensorData = sensorData;

            device.save(err => {
                if (err) {
                    Console.log(err)
                }
            });
        });
    }
});
/**
* @api {post} /send-command Send command to device
* @apiGroup Send-Command
* @apiSuccessExample {json} Success-Response:
* {
*   'Command sent'
* }
* @apiErrorExample {json} Error-Response:
* {
*   'Command not sent'
* }
*/
app.post('/send-command', (req, res) => {
    const { id, command } = req.body;
    const topic = `/219203655/command/${id}`;
    client.publish(topic, command, (err) => {
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

/**
* @api {put} /sensor-data Send random sensor data to database
* @apiGroup Sensor Data
* @apiSuccessExample {json} Success-Response:
* {
*   'published new message'
* }
* @apiErrorExample {json} Error-Response:
* {
*   'message not published'
* }
*/

app.put('/sensor-data', (req, res) => {
    const { deviceId } = req.body;

    const [lat, lon] = randomCoordinates().split(", ");
    const ts = new Date().getTime();
    const loc = { lat, lon };
    const temp = rand(20, 50);

    const topic = `/sensorData`;
    const message = JSON.stringify({ deviceId, ts, loc, temp });

    client.publish(topic, message, () => {
        res.send('published new message');
    });
});

app.use(express.static(`${__dirname}/public/generated-docs`));
app.get('/docs', (req, res) => {
    res.sendFile(`${__dirname}/public/generated-docs/index.html`);
});

app.listen(port, () => {
    console.log(`listening on port  ${port}`);
});