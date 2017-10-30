var editor; // use a global for the submit and return data rendering in the examples

$(document).ready(function() {

    var cur_facility = get_selected_facility_name();
    document.getElementById('panel-heading').innerHTML = cur_facility;

    // if the room database is empty, create a new database
    if (!rooms_db) {
        rooms_db = {};
    }

    // if the facility has no rooms, create a new section in the room database
    var facility_room_db = rooms_db[cur_facility];
    if (!rooms_db.hasOwnProperty(cur_facility)) {
        facility_room_db = {};
    };

    // Set up the editor
    editor = new $.fn.dataTable.Editor({
        table: "#example",
        fields: [{
            label: "Name:",
            name: "name"
        }, {
            label: "Max Capacity:",
            name: "max_cap"
        }],
        ajax: function(method, url, d, successCallback, errorCallback) {
            var output = {
                data: []
            };

            if (d.action === 'create') {
                $.each(d.data, function(key, value) {
                    value.DT_RowId = value.name;
                    value.cur_cap = 0;
                    facility_room_db[value.name] = value;
                    output.data.push(value);
                    add_room_to_fuego(value);
                });
            } else if (d.action === 'edit') {
                // Update each edited item with the data submitted
                $.each(d.data, function(id, value) {
                    value.DT_RowId = id;
                    $.extend(facility_room_db[id], value);
                    output.data.push(facility_room_db[id]);
                });
            } else if (d.action === 'remove') {
                // Remove items from the object
                $.each(d.data, function(id) {
                    remove_room_from_fuego(id);
                    delete facility_room_db[id];
                });
            }

            firebase.database().ref('rooms/' + cur_facility + '/').set(facility_room_db);
            successCallback(output);

            //refresh firebase
            fire_arr = load_fuegobase();
            fire_db = fire_arr[0];
            facilities_db = fire_arr[1];
            rooms_db = fire_arr[2];
            sensors_db = fire_arr[3];
        }
    });

    editor.on('preSubmit', function(e, o, action) {
        if (action !== 'remove') {
            var name = this.field('name');
            var max_cap = this.field('max_cap');

            if (!name.isMultiValue()) {
                if (!name.val()) {
                    name.error('A name must be given');
                }
            }
            if (!max_cap.isMultiValue()) {
                if (!max_cap.val()) {
                    max_cap.error('A maximum capacity must be given');
                }
                if (isNaN(max_cap.val())) {
                    max_cap.error('Maximum capacity must be a number');
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
        data: $.map(facility_room_db, function(value, key) {
            return value;
        }),
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
            data: "max_cap"
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
});
