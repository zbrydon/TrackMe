const dotenv = require('dotenv');
const axios = require('axios'); dotenv.config();
const { API_URL } = process.env;

test('test device array', () => {
    axios.get(`${API_URL}/devices`).then(resp => resp.data).then(resp => {
        console.log(resp[0]); expect(resp[0].user).toEqual('mary123');
    });
});

test('test user device array', () => {
    axios.get(`${API_URL}/users/admin/devices`).then(resp => resp.data).then(resp => {
        expect(resp[0].name).toEqual('phone')
    });
});

test('test device creation', () => {
    axios.post('/devices', {
        name: 'PC',
        user: 'admin'
    })
        .then(resp => resp.data).then
        (resp => {
            expect(resp).toEqual('successfully added device and data')
        })
});

test('test user login', () => {
    axios.post('/authenticate', {
        entered_username: 'admin',
        entered_password: 'admin'
    })
        .then(resp => resp.data).then
        (resp => {
            expect(resp.message).toEqual('Authenticated successfully')
        })
});

test('test user login', () => {
    axios.post('/authenticate', {
        entered_username: 'adminnnnnn',
        entered_password: 'admin'
    })
        .then(resp => resp.data).then
        (resp => {
            expect(resp).toEqual('User does not exist')
        })
});

test('test user login', () => {
    axios.post('/authenticate', {
        entered_username: 'admin',
        entered_password: 'adminnnnnn'
    })
        .then(resp => resp.data).then
        (resp => {
            expect(resp).toEqual('Incorrect password')
        })
});

test('test user registraion', () => {
    axios.post('/registration', {
        entered_username: 'admin',
        entered_password: 'adminnnnnn'
    })
        .then(resp => resp.data).then
        (resp => {
            expect(resp).toEqual('Incorrect password')
        })
});

test('test user registraion', () => {
    axios.post('/registration', {
        entered_username: 'adminn',
        entered_password: 'adminn'
    })
        .then(resp => resp.data).then
        (resp => {
            expect(resp.message).toEqual('Created new user')
        })
});

test('test device history', () => {
    axios.get('/devices/5f15032997e12a0e0017b597/device-history').then(resp => resp.data).then(resp => {
        expect(resp.temp).toEqual('14')
    })
});