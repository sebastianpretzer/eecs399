var editor; // use a global for the submit and return data rendering in the examples

$(document).ready(function() {

    if (!fire_db.hasOwnProperty('facilities')) {
        facilities_db = {};
    };

    // Set up the editor
    editor = new $.fn.dataTable.Editor({
        table: "#example",
        fields: [{
                label: "Name:",
                name: "name"
            }
            /*, {
                        label: "Max Capacity:",
                        name: "max_cap"
                    }*/
        ],
        ajax: function(method, url, d, successCallback, errorCallback) {
            var output = {
                data: []
            };

            if (d.action === 'create') {
                $.each(d.data, function(key, value) {
                    value.DT_RowId = value.name;
                    value.cur_cap = 0;
                    facilities_db[value.name] = value;
                    output.data.push(value);
                });
            } else if (d.action === 'edit') {
                // Update each edited item with the data submitted
                $.each(d.data, function(id, value) {
                    value.DT_RowId = id;
                    $.extend(facilities_db[id], value);
                    output.data.push(facilities_db[id]);
                });
            } else if (d.action === 'remove') {
                // Remove items from the object
                $.each(d.data, function(id) {
                    remove_facility_from_fuego(id);
                    delete facilities_db[id];
                });
            }

            firebase.database().ref('facilities/').set(facilities_db);
            successCallback(output);

            //refresh firebase
            fire_arr = load_fuegobase();
            fire_db = fire_arr[0];
            facilities_db = fire_arr[1];
            rooms_db = fire_arr[2];
            sensors_db = fire_arr[3];
        }
    });

    // Initialise the DataTable
    $('#example').DataTable({
        dom: "Bfrtip",
        data: $.map(facilities_db, function(value, key) {
            return value;
        }),
        select: {
            style: 'os',
            selector: 'td:first-child'
        },
        columns: [{
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: false
        }, {
            data: "name"
        }, {
            data: "cur_cap"
        }, {
            data: "max_cap",
            render: function(data, type, row) {
                var capacity = 0;
                if (rooms_db[row.name]) {
                    $.each(rooms_db[row.name], function(k, v) {
                        var room_cap = rooms_db[row.name][k].max_cap;
                        if (typeof room_cap == 'string') {
                            capacity = capacity + parseInt(room_cap);
                        } else {
                            capacity = capacity + room_cap;
                        }
                    });
                }
                //return JSON.stringify(rooms_db[row.name]);
                return capacity;
            }
        }, {
            data: "num_rooms",
            render: function(data, type, row) {
                if (row.room_arr) {
                    return row.room_arr.length;
                }
                return 0;
            }
        }, {
            data: "num_sensors",
            render: function(data, type, row) {
                if (row.sensor_arr) {
                    return row.sensor_arr.length;
                }
                return 0;
            }
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

    editor.on('preSubmit', function(e, o, action) {
        if (action !== 'remove') {
            var name = this.field('name');
            //var max_cap = this.field('max_cap');

            if (!name.isMultiValue()) {
                if (!name.val()) {
                    name.error('A name must be given');
                }
            }
            /*
            if (!max_cap.isMultiValue()) {
                if (!max_cap.val()) {
                    max_cap.error('A maximum capacity must be given');
                }
                if (isNaN(max_cap.val())) {
                    max_cap.error('Maximum capacity must be a number');
                }
            }*/
            if (this.inError()) {
                return false;
            }
        }
    });

    // Selecting the room
    var table = $('#example').DataTable();
    $('#example tbody').on('click', 'tr', function(evt) {
        var $cell = $(evt.target).closest('td');
        if ($cell.index() > 0) {
            var data = table.row(this).data();
            var name = data.name;
            window.location.href = 'room.html?' + name;
        }

    });
});
