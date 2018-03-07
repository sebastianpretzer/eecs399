/*
███████ ██ ██████  ███████ ██████   █████  ███████ ███████
██      ██ ██   ██ ██      ██   ██ ██   ██ ██      ██
█████   ██ ██████  █████   ██████  ███████ ███████ █████
██      ██ ██   ██ ██      ██   ██ ██   ██      ██ ██
██      ██ ██   ██ ███████ ██████  ██   ██ ███████ ███████
*/

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBnfn5nXUJrEjYEyx8ULii-7gR-XyS-Yqg",
    authDomain: "eecs-399.firebaseapp.com",
    databaseURL: "https://eecs-399.firebaseio.com",
    projectId: "eecs-399",
    storageBucket: "eecs-399.appspot.com",
    messagingSenderId: "307775102057"
  };
  firebase.initializeApp(config);

// Load Firebase data
var fire_arr = load_fuegobase();
var fire_db = fire_arr[0];
var facilities_db = fire_arr[1];
var rooms_db = fire_arr[2];
var sensors_db = fire_arr[3];

function load_fuegobase() {
    // get firebase reference
    var fire_db_ref = firebase.database().ref();
    //console.log(fire_db_ref)
    // store firebase data locally
    fire_db_ref.on("value", function(data) {
        var temp = data.val();
        //console.log(temp)
        localStorage.setItem('storage', JSON.stringify(temp));
    });

    // load local firebase data
    var fire_db = {}
    if (localStorage.getItem('storage')) {
        fire_db = JSON.parse(localStorage.getItem('storage'));
    }

    // set up individualized databases
    var sensors_db = fire_db.sensors;
    var facilities_db = fire_db.facilities;
    var rooms_db = fire_db.rooms;

    //console.log(fire_db)

    return [fire_db, facilities_db, rooms_db, sensors_db];
}



/*
███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
█████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/

const admin = require('firebase-admin');
const functions = require('firebase-functions');



/*
███████  █████   ██████ ██ ██      ██ ████████ ██    ██
██      ██   ██ ██      ██ ██      ██    ██     ██  ██
█████   ███████ ██      ██ ██      ██    ██      ████
██      ██   ██ ██      ██ ██      ██    ██       ██
██      ██   ██  ██████ ██ ███████ ██    ██       ██
*/

function add_facility_to_fuego(facility_name) {

}

function remove_facility_from_fuego(facility_name) {
    remove_facility_rooms(facility_name);
}

function remove_facility_rooms(facility_name) {
    if (facilities_db[facility_name].room_arr) {
        var room_arr = facilities_db[facility_name].room_arr;
        for (var i = 0; i < room_arr.length; i++) {
            var room_name = room_arr[i];
            remove_room_from_fuego(room_name, facility_name);
            delete rooms_db[facility_name];
        }
        firebase.database().ref('rooms/').set(rooms_db);
    }
}


/*
██████   ██████   ██████  ███    ███
██   ██ ██    ██ ██    ██ ████  ████
██████  ██    ██ ██    ██ ██ ████ ██
██   ██ ██    ██ ██    ██ ██  ██  ██
██   ██  ██████   ██████  ██      ██
*/

function get_selected_facility_name() {
    var link = window.location.toString();
    if (link.indexOf("facilities.html") !== -1) {
        return -1;
    }
    var cur_facility = link.substring(link.indexOf("?") + 1);
    cur_facility = decodeURI(cur_facility);
    return cur_facility;
}

function add_room_to_fuego(room) {
    add_room_to_facilities_db(room);
}

function add_room_to_facilities_db(room) {
    var cur_facility = get_selected_facility_name();
    var room_arr = [];
    if (facilities_db[cur_facility].room_arr) {
        room_arr = facilities_db[cur_facility].room_arr;
    }
    room_arr.push(room.name);
    firebase.database().ref('facilities/' + cur_facility + '/room_arr').set(room_arr);
}

function remove_room_from_fuego(room_name, facility_name) {
    remove_room_sensors(room_name, facility_name);
    remove_room_from_facilities_db(room_name, facility_name);
}

function remove_room_from_facilities_db(room_name, facility_name) {
    var cur_facility = get_selected_facility_name();
    if (cur_facility == -1) {
        cur_facility = facility_name;
    }
    var room_arr = [];
    if (facilities_db[cur_facility].room_arr) {
        room_arr = facilities_db[cur_facility].room_arr;
    }
    var i = room_arr.indexOf(room_name);
    if (i != -1) {
        room_arr.splice(i, 1);
    }
    firebase.database().ref('facilities/' + cur_facility + '/room_arr/').set(room_arr);
}

function remove_room_sensors(room_name, facility_name) {
    var cur_facility = get_selected_facility_name();
    if (cur_facility == -1) {
        cur_facility = facility_name;
    }
    if (rooms_db[cur_facility][room_name].sensor_arr) {
        var sensor_arr = rooms_db[cur_facility][room_name].sensor_arr;
        for (var i = 0; i < sensor_arr.length; i++) {
            var sensor_name = sensor_arr[i];
            remove_sensor_from_fuego(sensor_name);
            delete sensors_db[sensor_name];
        }
        firebase.database().ref('sensors/').set(sensors_db);
    }
}



/*
███████ ███████ ███    ██ ███████  ██████  ██████
██      ██      ████   ██ ██      ██    ██ ██   ██
███████ █████   ██ ██  ██ ███████ ██    ██ ██████
     ██ ██      ██  ██ ██      ██ ██    ██ ██   ██
███████ ███████ ██   ████ ███████  ██████  ██   ██
*/

function add_sensor_to_fuego(sensor) {
    add_sensor_to_facilities_db(sensor);
    add_sensor_to_rooms_db(sensor);
}

function add_sensor_to_facilities_db(sensor) {
    var sensor_arr = [];
    if (facilities_db[sensor.facility].sensor_arr) {
        sensor_arr = facilities_db[sensor.facility].sensor_arr;
    }
    sensor_arr.push(sensor.serial);
    firebase.database().ref('facilities/' + sensor.facility + '/sensor_arr/').set(sensor_arr);
}

function add_sensor_to_rooms_db(sensor) {
    var sensor_arr = [];
    if (rooms_db[sensor.facility][sensor.room].sensor_arr) {
        sensor_arr = rooms_db[sensor.facility][sensor.room].sensor_arr;
    }
    sensor_arr.push(sensor.serial);
    firebase.database().ref('rooms/' + sensor.facility + '/' + sensor.room + '/sensor_arr/').set(sensor_arr);
}

function remove_sensor_from_fuego(sensor_name) {
    remove_sensor_from_facilities_db(sensor_name);
    remove_sensor_from_rooms_db(sensor_name);
}

function remove_sensor_from_facilities_db(sensor_name) {
    var sensor_arr = [];
    if (facilities_db[sensors_db[sensor_name].facility].sensor_arr) {
        sensor_arr = facilities_db[sensors_db[sensor_name].facility].sensor_arr;
    }
    var i = sensor_arr.indexOf(sensor_name);
    if (i != -1) {
        sensor_arr.splice(i, 1);
    }
    firebase.database().ref('facilities/' + sensors_db[sensor_name].facility + '/sensor_arr').set(sensor_arr);
}

function remove_sensor_from_rooms_db(sensor_name) {
    var sensor_arr = [];
    if (rooms_db[sensors_db[sensor_name].facility][sensors_db[sensor_name].room].sensor_arr) {
        sensor_arr = rooms_db[sensors_db[sensor_name].facility][sensors_db[sensor_name].room].sensor_arr;
    }
    var i = sensor_arr.indexOf(sensor_name);
    if (i != -1) {
        sensor_arr.splice(i, 1);
    }
    firebase.database().ref('rooms/' + sensors_db[sensor_name].facility + '/' + sensors_db[sensor_name].room + '/sensor_arr').set(sensor_arr);
}
