var editor; // use a global for the submit and return data rendering in the examples

$(document).ready(function() {

    // if the sensor database is empty, create a new database
    if (!fire_db.hasOwnProperty('sensors')) {
        sensors_db = {};
    };

    // set up facilities list options
    var facilities_list = Object.keys(facilities_db);
    facilities_list = facilities_list.map(function(key) {
        return {
            label: key,
            value: key
        }
    });

    // set up rooms list options
    var rooms_list = {}
    $.each(rooms_db, function(k, v) {
        var room_list = Object.keys(v);
        room_list = room_list.map(function(key) {
            return {
                label: key,
                value: key
            }
        });
        rooms_list[k] = room_list;
    });

    // Set up the editor
    editor = new $.fn.dataTable.Editor({
        table: "#example",
        fields: [{
            label: "Serial:",
            name: "serial"
        }, {
            label: "Type:",
            name: "type",
            type: "select",
            options: [{
                label: "big",
                value: "big"
            }, {
                label: "small",
                value: "small"
            }]
        }, {
            label: "Facility:",
            name: "facility",
            type: "select",
            options: facilities_list
        }, {
            label: "Room:",
            name: "room",
            type: "select",
            options: rooms_list["Mudd Library"]
        }],
        i18n: {
            create: {
                title: "Pair a new sensor"
            },
            edit: {
                title: "Edit SERIAL",
                submit: "Update"
            },
            remove: {
                confirm: {
                    1: "Are you sure you wish to delete SERIAL?"
                }
            }
        },
        ajax: function(method, url, d, successCallback, errorCallback) {
            var output = {
                data: []
            };
            if (d.action === 'create') {
                $.each(d.data, function(key, value) {
                    value.DT_RowId = value.serial;
                    value.status = "off";
                    sensors_db[value.serial] = value;
                    output.data.push(value);
                    add_sensor_to_fuego(value);
                });
            } else if (d.action === 'edit') {
                $.each(d.data, function(id, value) {
                    value.DT_RowId = id;
                    $.extend(sensors_db[id], value);
                    output.data.push(sensors_db[id]);
                });
            } else if (d.action === 'remove') {
                $.each(d.data, function(id) {
                    remove_sensor_from_fuego(id);
                    delete sensors_db[id];
                });
            }
            firebase.database().ref('sensors/').set(sensors_db);
            successCallback(output);

            //refresh firebase
            fire_arr = load_fuegobase();
            fire_db = fire_arr[0];
            facilities_db = fire_arr[1];
            rooms_db = fire_arr[2];
            sensors_db = fire_arr[3];
        }
    });

    // changes the dropdown of the room, depending on the facility selected
    editor.dependent('facility', function(val) {
        return {
            "options": {
                "room": rooms_list[val]
            }
        }
    });

    // checks for incomplete submissions
    editor.on('preSubmit', function(e, o, action) {
        if (action !== 'remove') {
            var room = this.field('room');
            var facility = this.field('facility');
            var serial = this.field('serial');

            if (!room.val()) {
                facility.error('Please select a facility with rooms');
            }
            if (!serial.isMultiValue()) {
                if (!serial.val()) {
                    serial.error('A serial must be given');
                }
            }
            if (this.inError()) {
                return false;
            }
        }
    });

    // Initialise the DataTable
    $('#example').DataTable({
        dom: "Bfrtip",
        data: $.map(sensors_db, function(value, key) {
            return value;
        }),
        columns: [{
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: false
        }, {
            data: "serial"
        }, {
            data: "type"
        }, {
            data: "facility"
        }, {
            data: "room"
        }, {
            data: "status"
        }, ],
        "paging": false,
        "info": false,
        select: true,
        buttons: [{
                extend: "create",
                editor: editor
            },
            {
                extend: "edit",
                editor: editor
            },
            {
                extend: "remove",
                editor: editor
            }
        ]
    });
});
