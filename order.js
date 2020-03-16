$(document).ready(function () {

    //Base URL
    var baseurl = $("#baseurl").val();

    //ORDER LIST FINAL CUSTOMER CODE TO FILL IN ADDRESS SHIP
    $(document).on('change', '#FinalCustomer', function () {
        var parentThis = $(this);
        $('#AddressShip').removeAttr('disabled');
        $("#AddressShip").prop("selectedIndex", 0);

        $('#AddressShip option').each(function () {
            $(this).removeClass('hidden');
            if ($(this).val() != parentThis.val() && $(this).val() != "") {
                $(this).addClass('hidden');
            }
        });
    });

    // ORDER/ORDER HISTORY
    $('#tbl-order-list thead th.filter').each(function () {
        var title = $(this).text();
        $(this).html('<input type="text" placeholder="' + title + '" class="form-control" />');
    });

    var orderList = $('#tbl-order-list').DataTable({
        "ordering": false,
        "searching": false,
        "bLengthChange": false,
        "searchable": false,


        initComplete: function () {
            this.api().columns().every(function () {
                var column = this;
                if ($(column.header()).hasClass('select-packsize')) {
                    var column = this;
                    var select = $('<select class="form-control"><option value="" placeholder="Packsize">Packsize</option></select>')
                        .appendTo($('th.select-packsize').empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );

                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });

                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });
                } else
                    if ($(column.header()).hasClass('select-packaging')) {
                        var column = this;
                        var select = $('<select class="form-control"><option value="" placeholder="Packaging">Packaging</option></select>')
                            .appendTo($('th.select-packaging').empty())
                            .on('change', function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );

                                column
                                    .search(val ? '^' + val + '$' : '', true, false)
                                    .draw();
                            });

                        column.data().unique().sort().each(function (d, j) {
                            select.append('<option value="' + d + '">' + d + '</option>')
                        });
                    }
            });
        }
    });

    orderList.columns().every(function () {

        var that = this;

        $('input', this.header()).on('keyup change', function () {
            if (that.search() !== this.value) {
                that
                    .search(this.value)
                    .draw();
            }
        });
    });

    orderList.columns().every(function () {

        var that = this;

        $('input', this.header()).on('keyup change', function () {
            if (that.search() !== this.value) {
                that
                    .search(this.value)
                    .draw();
            }
        });
    });

    // Add event listeners to the two range filtering inputs
    $('#datefrom, #dateto').keyup(function () { orderList.draw(); });

    document.getElementById('file').onchange = function () {
        var filesize = document.getElementById('file').files[0].size;
        if (filesize > 10000000) {
            $(this).val("");
            alert("Maximum file size is 10 Mb, please choose another file...");
        }
        console.log(filesize);
    }

    // Confirm Order
    $('.btn-confirm-order').click(function () {
        if ($('#AddressShip').val()) {
            //Validation
            var table = $('#tbl-order-list').DataTable();
            var rows = table.rows().data();
            var qtyIsFilled = 0;
			console.log(rows)

            $.each(rows, function (i, v) {
				
				var test = $.each(v, function(i,val){
//console.log('ini val ke ' + val)
			})
				
						//console.log(test)
				
                var qty = $('#tbl-order-list tbody').find('tr:eq(' + i + ')').find("td:eq(5)").find('input').val();
                console.log($('#tbl-order-list tbody').find('tr:eq(' + i + ')').find("td:eq(5)").find('input[type="number"]').val());
				//console.log($('#tbl-order-list tbody').find('tr:eq(' + i + ')'))
				//console.log(qty);
				
                if (qty === "" || parseInt(qty) === 0 || parseInt(qty) < 0 || parseInt(qty) > 5) {
                    qtyIsFilled = qtyIsFilled + 1;
                    console.log('var qtyIsFilled= ' + qtyIsFilled);
                }
            });

            var dataRowJson = new Array;

            if (rows.length !== 0) {
                if (qtyIsFilled === 0) {
                    $('.confirm-order').modal('show');

                    $('.yes').click(function () {
                        $('button').prop('disabled', true);
                        $('button.yes').attr('id', 'ConfirmYes');
                        $('.confirm-order-waiting').modal('show');
                        $('.confirm-order').modal('hide');
                        function submit(url, data) {
                            // Return a new promise.
                            return new Promise(function (resolve, reject) {

                                // Do the usual XHR stuff
                                var req = new XMLHttpRequest();
                                req.open('POST', url);

                                req.onload = function () {
                                    // This is called even on 404 etc
                                    // so check the status
                                    if (req.status === 200) {
                                        // Resolve the promise with the response text
                                        resolve(req.response);
                                    }
                                    else {
                                        // Otherwise reject with the status text
                                        // which will hopefully be a meaningful error
                                        reject(Error(req.statusText));
                                    }
                                };

                                // Handle network errors
                                req.onerror = function () {
                                    reject(Error("Network Error"));
                                };

                                // Make the request
                                req.send(data);
                            });
                        }

                        // Checking whether FormData is available in browser  
                        if (window.FormData !== undefined) {

                            var fileUpload = $("#file").get(0);
                            var files = fileUpload.files;

                            // Create FormData object  
                            var fileData = new FormData();

                            // Looping over all files and add it to FormData object  
                            for (var i = 0; i < files.length; i++) {
                                fileData.append(files[i].name, files[i]);
                            }

                            if (files.length !== 0) {

                                submit(baseurl + '/Order/UploadFiles', fileData).then(function (resolve) {
                                    var dataRawJson = new Object();
                                    dataRawJson.OrderSessionModels = new Array();

                                    //dataRawJson.Order = new Object();
                                    dataRawJson.Extension = $.parseJSON(resolve).Detail;

                                    if ($('input[name="FinalCustomer"]').length != null && $('input[name="AddressShip"]').length != null) {
                                        dataRawJson.FinalCustomer = $("#FinalCustomer").val();
                                        dataRawJson.AddressShip = $("#AddressShip").val();
                                    }
                                    else {
                                        dataRawJson.FinalCustomer = $("#FinalCustomer option:selected").val();
                                        dataRawJson.AddressShip = $("#AddressShip option:selected").val();
                                    }


                                    $('#tbl-order-list tbody tr').each(function (i, val) {
                                        var OrderListItem = new Object();

                                        OrderListItem.ProductsId = $('#tbl-order-list tbody tr:eq(' + i + ') td:eq(0)').text().replace(/[\W_]+/g, "");
                                        OrderListItem.ProductsCode = $.trim($('#tbl-order-list tbody tr:eq(' + i + ') td:eq(1)').text().replace(/\r?\n|\r/g, ""));
                                        OrderListItem.ProductsName = $.trim($('#tbl-order-list tbody tr:eq(' + i + ') td:eq(2)').text().replace(/\r?\n|\r/g, ""));
                                        OrderListItem.ProductsPackSize = $('#tbl-order-list tbody tr:eq(' + i + ') td:eq(3)').text().replace(/[\W_]+/g, "");
                                        OrderListItem.ProductsPackaging = $('#tbl-order-list tbody tr:eq(' + i + ') td:eq(4)').text().replace(/[\W_]+/g, "");
                                        OrderListItem.Quantity = parseInt($('#tbl-order-list tbody tr:eq(' + i + ') td:eq(5) input').val());
										console.log( OrderListItem.Quantity = parseInt($('#tbl-order-list tbody tr:eq(' + i + ') td:eq(5) input').val()))

                                        dataRawJson.OrderSessionModels.push(OrderListItem);
                                    });

                                    console.log(dataRawJson);

                                    $.post(baseurl + "/Order/Create", { postRawJson: JSON.stringify(dataRawJson) }, function (data) {
                                        if (data.Code !== 400 || data.Code !== 404) {
                                            window.location.href = baseurl + "/Order/Confirmation";
                                            //$.redirect('/Order/Confirmation', data);
                                        }
                                        else {
                                            alert("Error " + data.Code + ", Message : " + data.Message + " (On Modul : " + data.Detail + ") ");
                                        }
                                    });
                                }, function (error) {
                                    console.error("Failed! ", error);
                                });
                            }
                            else {
                                var dataRawJson = new Object();
                                dataRawJson.OrderSessionModels = new Array();

                                if ($('input[name="FinalCustomer"]').length != null && $('input[name="AddressShip"]').length != null) {
                                    dataRawJson.FinalCustomer = $("#FinalCustomer").val();
                                    dataRawJson.AddressShip = $("#AddressShip").val();
                                }
                                else {
                                    dataRawJson.FinalCustomer = $("#FinalCustomer option:selected").val();
                                    dataRawJson.AddressShip = $("#AddressShip option:selected").val();
                                }

                                $('#tbl-order-list tbody tr').each(function (i, val) {
                                    var OrderListItem = new Object();

                                    OrderListItem.ProductsId = $('#tbl-order-list tbody tr:eq(' + i + ') td:eq(0)').text().replace(/[\W_]+/g, "");
                                    OrderListItem.ProductsCode = $.trim($('#tbl-order-list tbody tr:eq(' + i + ') td:eq(1)').text().replace(/\r?\n|\r/g, ""));
                                    OrderListItem.ProductsName = $.trim($('#tbl-order-list tbody tr:eq(' + i + ') td:eq(2)').text().replace(/\r?\n|\r/g, ""));
                                    OrderListItem.ProductsPackSize = $('#tbl-order-list tbody tr:eq(' + i + ') td:eq(3)').text().replace(/[\W_]+/g, "");
                                    OrderListItem.ProductsPackaging = $('#tbl-order-list tbody tr:eq(' + i + ') td:eq(4)').text().replace(/[\W_]+/g, "");
                                    OrderListItem.Quantity = parseInt($('#tbl-order-list tbody tr:eq(' + i + ') td:eq(5) input').val());

                                    dataRawJson.OrderSessionModels.push(OrderListItem);
                                });

                                console.log(dataRawJson);

                                $.post(baseurl + "/Order/Create", { postRawJson: JSON.stringify(dataRawJson) }, function (data) {
                                    if (data.Code !== 400 || data.Code !== 404) {
                                        //window.location.href = "/Order/Confirmation";
                                        $.redirect(baseurl + '/Order/Confirmation', data);
                                    }
                                    else {
                                        alert("Error " + data.Code + ", Message : " + data.Message + " (On Modul : " + data.Detail + ") ");
                                    }
                                });
                            }
                        } else {
                            alert("FormData is not supported.");
                        }
                    });
                }
                else {
                    BootstrapDialog.alert("Quantity can't be empty, 0, Negative and Maximal Quantity can't be more than 5 digits!");
                }
            }
            else {
                BootstrapDialog.alert('Select a product first!');
            }

            $('.no').click(function () {
                $('.confirm-order').modal('hide');
            });
        }
        else {
            BootstrapDialog.alert('Please select Final Customer Name & Address Ship');
        }
    });

    $(document).on('click', '.create-lookalike-order', function (e) {
        e.preventDefault();
        $.post(baseurl + "/Order/Index", { id: $(this).data("value") }, function (data) {
            if (data.Code !== 400 || data.Code !== 404) {
                window.location.href = baseurl + "/Order";
            }
            else {
                alert("Error " + data.Code + ", Message : " + data.Message + " (On Modul : " + data.Detail + ") ");
            }
        });
    });

    //Delete Order Session
    $('.delete-order').click(function (e) {
        e.preventDefault();

        table = $('#tbl-order-list').DataTable();
        row = $(this).closest('tr');
        id = table.row(row).data()[0];

        BootstrapDialog.show({
            title: 'Delete Confirmation',
            message: 'Are You Sure Delete This Item?',
            buttons: [{
                label: 'Yes',
                action: function (dialog) {
                    $.ajax({
                        url: baseurl + "/Order/deleteSessionOrders",
                        type: "POST",
                        data: JSON.stringify({ productId: id }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        error: function (response) {
                            console.log(response.responseText);
                        },
                        success: function (response) {

                            dialog.close();

                            table
                                .row(row)
                                .remove()
                                .draw();

                            console.log(response);
                        }
                    });
                }
            }, {
                label: 'No',
                action: function (dialog) {
                    dialog.close();
                }
            }]
        });
    });
});
