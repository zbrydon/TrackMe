//import { response } from "express";

$('#navbar').load('navbar.html');
$('#footer').load('footer.html');
const API_URL = 'https://api-sepia-alpha.vercel.app/api';
const MQTT_URL = 'http://localhost:5001/send-command';

const currentUser = localStorage.getItem('user');
if (currentUser) {
    $.get(`${API_URL}/users/${currentUser}/devices`).then(response => {
        response.forEach((device) => {
            $('#devices tbody').append(` <tr data-device-id=${device._id}>
                    <td>${device.user}</td>
                    <td>${device.name}</td>
                </tr>` );
        });
        $('#devices tbody tr').on('click', (e) => {
            const deviceId = e.currentTarget.getAttribute('data-device-id');

            $.get(`${API_URL}/devices/${deviceId}/device-history`).then(response => {
                response.map(sensorData => {
                    $('#historyContent').append(`
                    <tr>
                        <td>${sensorData.ts}</td>
                        <td>${sensorData.temp}</td>
                        <td>${sensorData.loc.lat}</td>
                        <td>${sensorData.loc.lon}</td>
                    </tr>
                    `);
                });
                $('#historyModal').modal('show');
                $('#historyModal').on('hidden.bs.modal', function () {
                    $('#historyModal tbody tr').html('');
                });
            });
        });
    })
        .catch(error => {
            console.error(`Error: ${error}`);
        });
} else {
    const path = window.location.pathname;
    if (path !== '/login') {
        location.href = '/login';
    }
}

const devices = JSON.parse(localStorage.getItem('devices')) || [];
const users = JSON.parse(localStorage.getItem('users')) || [];

devices.forEach(function (device) {
    $('#devices tbody').append(`
    <tr>
        <td>${device.user}</td>
        <td>${device.name}</td>
    </tr>`
    );
});

users.forEach(function (user) {
    $('#users tbody').append(`
    <tr>
        <td>${user.username}</td>
        <td>${user.pass1}</td>
    </tr>`
    );
});

$('#add-device').on('click', () => {
    const name = $('#name').val();
    const user = $('#user').val();
    const sensorData = [];
    const body = {
        name, user,
        sensorData
    };
    $.post(`${API_URL}/devices`, body).then(response => {
        location.href = '/';
    })
        .catch(error => {
            console.error(`Error: ${error}`);
        });
});

$('#send-command').on('click', function () {
    const command = $('#command').val();
    const id = $('#id').val();
    console.log(`id is: ${id}  command is: ${command}`);
    $.post(`${MQTT_URL}`, { id, command }).then((response) => {
        if (response.success) {
            $('#message').append('<p class="alert alert-success">Sent</p>');
        }
        else {
            $('#message').append(`<p class="alert alert-danger">Not Sent</p>`);
        }
    })
});

$('#register').on('click', () => {
    const entered_username = $('#entered_username').val();
    const entered_pass1 = $('#entered_pass1').val();
    const entered_pass2 = $('#entered_pass2').val();
    if (entered_pass1 == entered_pass2) {
        $.post(`${API_URL}/registration`, { entered_username, entered_password }).then((response) => {
            if (response.success) {
                location.href = '/login';
            } else {
                $('#message').append(`<p class="alert alert-danger">${response}</p>`);
            }
        })
    }
    else if (pass1 != pass2) {
        document.getElementById('message').innerHTML = "Passwords must match";
    }
});

$('#login').on('click', () => {
    const entered_username = $('#entered_username').val();
    const entered_password = $('#entered_password').val();

    $.post(`${API_URL}/authenticate`, { entered_username, entered_password }).then((response) => {
        if (response.success) {
            localStorage.setItem('user', entered_username);
            localStorage.setItem('isAdmin', response.isAdmin);
            localStorage.setItem('isAuthenticated', true);
            location.href = '/';
        } else {
            $('#message').append(`<p class="alert alert-danger">${response}</p>`);
            console.log(user);
            console.log(password);
        }
    });
});

const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    location.href = '/login';
}