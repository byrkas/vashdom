var DatatableRecordSelectionDemo = function() {
    var t = function() {
        var t = $(".m_datatable").mDatatable({
	            data: {
	                type: "remote",
	                source: {
	                    read: {
	                        url: "/backend/region/get-data"
	                    }
	                },
	                pageSize: 20,
	                saveState: {
	                    cookie: !0,
	                    webstorage: !0
	                },
	                serverPaging: !0,
	                serverFiltering: !0,
	                serverSorting: !0
	            },
	            layout: {
	                theme: "default",
	                class: "",
	                scroll: !0,
	                height: "auto",
	                footer: !1
	            },
	            sortable: !0,
	            toolbar: {
	                placement: ["bottom"],
	                items: {
	                    pagination: {
	                        pageSizeSelect: [5, 10, 20, 30, 50]
	                    }
	                }
	            },
                columns: [{
                    field: "id",
                    title: "#",
                    sortable: !1,
                    width: 40,
                    textAlign: "center",
                    selector: {
                        class: "m-checkbox--solid m-checkbox--brand"
                    }
                },{
                    field: "name",
                    title: "Name",
                    textAlign: "left",
                },{
                    field: "Actions",
                    width: 70,
                    title: "Actions",
                    sortable: !1,
                    textAlign: "right",
                    template: function(t) {
                        return '<a href="/backend/region/edit/'+t.id+'" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill" title="Edit details">\t\t\t\t\t\t\t<i class="la la-edit"></i>\t\t\t\t\t\t</a>'
                        + '\t\t\t\t\t\t<a href="javascript:void(0)" data-id="'+t.id+'" class="delete-btn m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill" title="Delete">\t\t\t\t\t\t\t<i class="la la-trash"></i>\t\t\t\t\t\t</a>'
                    }
                }]
            }),
            e = t.getDataSourceQuery();
        $("#m_form_search").on("keyup", function(e) {
            var a = t.getDataSourceQuery();
            a.generalSearch = $(this).val().toLowerCase(), t.setDataSourceQuery(a), t.load()
        }).val(e.generalSearch), 
        $(".m_datatable").on("m-datatable--on-check", function(e, a) {
            var l = t.setSelectedRecords().getSelectedRecords().length;
            $("#m_datatable_selected_number").html(l), l > 0 && $("#m_datatable_group_action_form").collapse("show")
        }).on("m-datatable--on-uncheck m-datatable--on-layout-updated", function(e, a) {
            var l = t.setSelectedRecords().getSelectedRecords().length;
            $("#m_datatable_selected_number").html(l), 0 === l && $("#m_datatable_group_action_form").collapse("hide")
        }),
        $("#m_datatable_check_all").on('click',function(){
        	var idsToDelete = [];
        	$.each(t.getSelectedRecords(), function(key, val){
        		idsToDelete.push($(val).find('input[type=checkbox]').val());
        	});        	
        	if (confirm('Are you sure?')) {        		
        		deleteData('/backend/region/delete',{ids: idsToDelete},t);
    		}
        }),
        $(".m_datatable").on('click','.delete-btn',function(e){
        	e.preventDefault();
        	var idsToDelete = [];
        	idsToDelete.push($(this).data('id'));
        	       	
        	if (confirm('Are you sure?')) {        		
        		deleteData('/backend/region/delete',{ids: idsToDelete},t);
    		}
        })
    };
    return {
        init: function() {
            t()
        }
    }
}();

function deleteData(url, postData, t){
	$.post( url, postData, function( data ) {	  
	  if(data.success){
		  t.reload();
	  }
	}, "json");
}

jQuery(document).ready(function() {
    DatatableRecordSelectionDemo.init()
});