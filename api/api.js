const express = require('express');
const mongoose = require('mongoose');
const Device = require('./models/device');
const User = require('./models/user');

mongoose.connect("mongodb+srv://zbrydon:zbrydon@sit209.dss4j.mongodb.net/sit209", { useNewUrlParser: true, useUnifiedTopology: true });
/*mongoose.connect("mongodb+srv://kev:kev1234@cluster0.fi0ga.mongodb.net", { useNewUrlParser: true, useUnifiedTopology: true });*/

 

const app = express();
const bodyParser = require('body-parser'); app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const port = process.env.PORT || 5000;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
    next();
}); 

/**
* @api {get} /api/test Test if the API is working
* @apiGroup Test
* @apiSuccessExample {json} Success-Response:
* {
*   'The API is working!'
* }
* @apiErrorExample {json} Error-Response:
* {
*   404: Not found
* }
*/

app.get('/api/test', (req, res) => {
    res.send('The API is working!');
});

/**
* @api {get} /api/users/:user/devices Returns only current users devices
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* [
*   {
*   "_id": "dsohsdohsdofhsofhosfhsofh",
*   "name": "iPhone",
*   "user": "admin",
*        "sensorData": [
*        {
*           "ts": "1529542230",
*           "temp": 12,
*           "loc": {
*               "lat": -37.84674,
*               "lon": 145.115113
*               }
*           },
*           {
*           "ts": "1529572230",
*           "temp": 17,
*           "loc": {
*               "lat": -37.850026,
*               "lon": 145.117683
*           }
*        }
*      ]
*   },
*   {
*   "_id": "ewrtreytetrwertwrerwerewrewrwer",
*   "name": "laptop",
*   "user": "admin",
*        "sensorData": [
*        {
*           "ts": "152666666230",
*           "temp": 22,
*           "loc": {
*               "lat": 107.84674,
*               "lon": 45.115113
*               }
*           },
*           {
*           "ts": "152959999999",
*           "temp": 37,
*           "loc": {
*               "lat": -37.850026,
*               "lon": 145.117683
*           }
*        }
*      ]
*   }
* ]
* @apiErrorExample {json} Error-Response:
* {
*  "User does not exist"
* }
*/

app.get('/api/users/:user/devices', (req, res) => {
    const { user } = req.params;
    Device.find({ "user": user }, (err, devices) => {
        return err
            ? res.send(err)
            : res.send(devices);
    });
});

/** 
* @api {get} /api/devices AllDevices An array of all devices 
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* [ 
*   { 
*   "_id": "dsohsdohsdofhsofhosfhsofh", 
*   "name": "Mary's iPhone", 
*   "user": "mary",
*        "sensorData": [ 
*        {
*           "ts": "1529542230", 
*           "temp": 12,
*           "loc": {
*               "lat": -37.84674, 
*               "lon": 145.115113
*               }
*           }, 
*           {
*           "ts": "1529572230", 
*           "temp": 17,
*           "loc": {
*               "lat": -37.850026, 
*               "lon": 145.117683
*           } 
*        } 
*      ]
*   }
* ]
* @apiErrorExample {json} Error-Response: 
* { 
*  "User does not exist"
* }
*/

app.get('/api/devices', (req, res) => {
    Device.find({}, (err, devices) => {
        if (err == true) {
            return res.send(err);
        } else {
            return res.send(devices);
        }
    });
});

/**
* @api {post} /api/devices Creates a new device
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* {
*   'successfully added device and data'
* }
* @apiErrorExample {json} Error-Response:
* {
*  "Device not added"
* }
*/

app.post('/api/devices', (req, res) => {
    const { name, user, sensorData } = req.body;
    const newDevice = new Device({
        name, user,
        sensorData
    });
    newDevice.save(err => {
        return err
            ? res.send(err)
            : res.send('successfully added device and data');
    });
});

/**
* @api {post} /api/send-command Sends Command
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* {
*   'Some command'
* }
*/

app.post('/api/send-command', (req, res) => {
    console.log("Command Sent");
    res.send('Some command');
});

/**
* @api {post} /api/authenticate Authenticates user
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* {
*   "success": "true",
*   "message": "Authenticated successfully",
*   "isAdmin": "user.isAdmin"
* }
* @apiErrorExample {json} Error-Response:
* {
*  "User does not exist"
* }
* @apiErrorExample {json} Error-Response:
* {
*  "Incorrect password"
* }
*/

app.post('/api/authenticate', (req, res) => {
    const { entered_username, entered_password } = req.body;
    User.findOne({ username: entered_username }, (err, user) => {
        if (err == true) {
            return res.send(err);
        } else if (user === null) {
            return res.send("User does not exist");
        } else if (user.password !== entered_password) {
            return res.send("Incorrect password");
        } else if (user !== null && user.password === entered_password) {
            return res.json({
                success: true,
                message: 'Authenticated successfully',
                isAdmin: user.isAdmin
            });
        }
    });
});

/**
* @api {post} /api/authenticate Registers user
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* {
*   "success": "true",
*   "message": "Created new user"
* }
* @apiErrorExample {json} Error-Response:
* {
*  "User already exists"
* }
*/

app.post('/api/registration', (req, res) => {
    const { entered_username, entered_password, isAdmin } = req.body;
    User.findOne({ username: entered_username }, (err, user) => {
        if (err == true) {
            return res.send(err);
        } else if (user !== null) {
            return res.send("User already exist");
        } else {
            const newUser = new User({
                username: entered_username,
                password: entered_password,
                isAdmin 
            });
            newUser.save(err => {
                return err
                    ? res.send(err) :
                    res.json({
                        success: true,
                        message: 'Created new user'
                    });
            });
        }
    });
});

/**
* @api {post} /api/devices/:deviceId/device-history Displays device history
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* {
*       "ts": "1529542230",
*       "temp": 12,
*       "loc": {
*           "lat": -37.84674,
*           "lon": 145.115113
*           }
*       },
*       {
*       "ts": "1529572230",
*       "temp": 17,
*       "loc": {
*           "lat": -37.850026,
*           "lon": 145.117683
*}
* @apiErrorExample {json} Error-Response:
* {
*   "404: Not found"
* }
*/

app.get('/api/devices/:deviceId/device-history', (req, res) => {
    const { deviceId } = req.params; Device.findOne({ "_id": deviceId }, (err, devices) => {
        const { sensorData } = devices; return err
            ? res.send(err) : res.send(sensorData);
    });
});

app.use(express.static(`${__dirname}/public`)); app.get('/docs', (req, res) => {
    res.sendFile(`${__dirname}/public/generated-docs/index.html`);
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});