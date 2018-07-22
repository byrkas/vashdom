function initializeDatepicker(elem, singleDate, setDate, retElem, singleMonth, format, lang) {
     if (setDate == undefined || setDate == '') {
        setDate = new Date();
        setDate.setDate(setDate.getDate() + 1);
    }
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 365);

    if (singleMonth == undefined) {
    	singleMonth = false;
    }
    if (format == undefined) {
    	format = "MM/DD/YYYY";
    }
    if (lang == undefined) {
    	lang = "auto";
    }
    elem.dateRangePicker({
        startOfWeek: 'monday',
        autoClose: true,
        startDate: setDate,
        language: lang,
        extraClass: 'datepicker-custom',
        hoveringTooltip: false,
        showTopbar: false,
        stickyMonths: true,
        singleMonth: singleMonth,
        singleDate: singleDate,
        endDate: endDate,
        format: format,
        customArrowPrevSymbol: '<i class="icn-calendar-prev"></i>',
        customArrowNextSymbol: '<i class="icn-calendar-next"></i>',
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
        getValue: function () {
            if (elem.val() && singleDate == false) {
            	if(retElem != null && retElem.val())
            		return elem.val() + ' to ' + retElem.val();
            	else
            		return elem.val();
            } else {
                return elem.val();
            }
        },
        setValue: function (s, s1, s2) {
            elem.val(s1);
            if (singleDate == false) {
                retElem.val(s2);
            }
        }
    }).bind('datepicker-close', function() {
    	if (singleDate == false) {
    		retElem.blur();
    	}
    }).bind('datepicker-open', function () {
    	elem.parent().css({position: 'relative'});
    	$('.date-picker-wrapper').appendTo(elem.parent());

    	$('.cover__form [data-toggle="dropdown"]').parent().removeClass('open');
    }).bind('datepicker-first-date-selected', function(event, obj) {
        elem.val(moment(obj.date1).format(format));
        if (singleDate == false) {
             retElem.focus();
        }
    });
}