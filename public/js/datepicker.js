function initializeDatepicker(elem, singleDate, depElem, retElem, startDate, container, targetEl, callback) {
    if (startDate === undefined) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
    }
    if (container === undefined) {
        container = '#dates-overlay .overlay-screen-body';
    }
    var width = window.innerWidth;
    var inline = true;
    var singleMonth = 'all';
    var quickReSelect = false;
    var fromFieldId = '', toFieldId = '',
        retDateIsFocus = false;
    if (width > 768) {
    	if(container == '#dates-overlay .overlay-screen-body')
    		container = '#dates-overlay';
        inline = false;
        singleMonth = 'auto';
    }
    if (depElem !== undefined && retElem !== undefined){
    	quickReSelect = true;
    	fromFieldId = depElem.attr('id');
    	toFieldId = retElem.attr('id');
    }
    if (depElem === undefined) {
    	depElem = elem;
    }

    format = "MM/DD/YYYY";
    elem.dateRangePicker({
        startOfWeek: 'monday',
        language: moment.locale(),
        format: "MM/DD/YYYY",
        startDate: startDate,
        singleDate: singleDate,
        hoveringTooltip: false,
        showTopbar: false,
        //selectForward: false,
        stickyMonths: true,
        customArrowPrevSymbol: '<i class="icn-calendar-prev"></i>',
        customArrowNextSymbol: '<i class="icn-calendar-next"></i>',
        autoClose: true,
        extraClass: 'datepicker-custom',
        singleMonth: singleMonth,
        inline: inline,
        container: container,
        alwaysOpen: inline,
        fromFieldId: fromFieldId,
        toFieldId: toFieldId,
        quickReSelectAlg: quickReSelect,
        customOpenAnimation: function () {
            $(this).show();
        },
        customCloseAnimation: function () {
            $(this).hide();
        },
        getValue: function () {
            if (depElem.val() && singleDate === false) {
                if (retElem != null && retElem.val())
                    return depElem.val() + ' to ' + retElem.val();
                else
                    return depElem.val();
            } else {
                return depElem.val();
            }
        },
        setValue: function (s, s1, s2) {
        	depElem.val(s1);
            if(s1){
            	depElem.parents('.form-group').addClass('has-value');
            	depElem.parents('.form-group').find('.field-date__nmb').text(moment(s1, format).format('D'));
            	depElem.parents('.form-group').find('.field-date__day').text(moment(s1, format).format('MMM. YYYY'));
            	depElem.parents('.form-group').find('.field-date__dow').text(moment(s1, format).format('dddd'));
            }
            if (s2 != null && s2 != 'Invalid date' && s2 != '01/01/1970') {
                retElem.val(s2);
                if(s2){
                	retElem.parents('.form-group').addClass('has-value');
                    retElem.parents('.form-group').find('.field-date__nmb').text(moment(s2, format).format('D'));
                    retElem.parents('.form-group').find('.field-date__day').text(moment(s2, format).format('MMM. YYYY'));
                    retElem.parents('.form-group').find('.field-date__dow').text(moment(s2, format).format('dddd'));
                }
            }
        }
    }).bind('datepicker-open', function(){
        retDateIsFocus = retElem && retElem.is(":focus") || false;
        $('.search-form .passengers-number-dropdown').removeClass('show');
    }).bind('datepicker-close', function () {
        if (singleDate === false) {
            retElem.blur();
            retElem.parents('.form-overlay').removeClass('active');
        }

    	depElem.parents('.form-overlay').removeClass('active');
    }).bind('datepicker-first-date-selected', function (event, obj) {
        if (singleDate === false) {
            var selDate = moment(obj.date1).format(format);
            if (retDateIsFocus && new Date(selDate).getTime() < new Date(depElem.val()).getTime() ||
                new Date(selDate).getTime() > new Date(retElem.val()).getTime()) {
                retElem.val("");
                if (typeof callback === "function") {
                    callback.call(this);
                }
            }
            retElem.focus();
        }
        depElem.val(moment(obj.date1).format(format));
        depElem.parents('.form-group').addClass('has-value');
        depElem.parents('.form-group').find('.field-date__nmb').text(moment(obj.date1, format).format('D'));
        depElem.parents('.form-group').find('.field-date__day').text(moment(obj.date1, format).format('MMM. YYYY'));
        depElem.parents('.form-group').find('.field-date__dow').text(moment(obj.date1, format).format('dddd'));
    });
}