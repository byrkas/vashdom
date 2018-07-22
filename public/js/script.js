$(document).ready(function(){
    $(document).on('click', 'header .burger', function(){
        if($(this).is('.close')){
            $(this).removeClass('close');
            $(this).parent().removeClass('active');
        }else{
            $(this).addClass('close');
            $(this).parent().addClass('active');
        }
    });
    $('nav a[href^="#"], nav a[href^="/#"], .m-scroll').click(function(){
        var elementClick = $(this).attr("href").replace('/','');
        var destination = $(elementClick).offset().top;
        $("html:not(:animated),body:not(:animated)").animate({
          scrollTop: destination
        }, 800, function(){

        $('header .burger').removeClass('close');
        $('header').removeClass('active');
        });
        return false;
    });
     $(document).on('click', '.selectable > .text', function(){
        if($(this).is('.close')){
            $(this).removeClass('close');
            $(this).parent().removeClass('active');
        }else{
            $(this).addClass('close');
            $(this).parent().addClass('active');
        }
    });

     $(document).on('click', '.select > .text', function(){
        if($(this).is('.close')){
            $(this).removeClass('close');
            $(this).parent().removeClass('active');
        }else{
            $(this).addClass('close');
            $(this).parent().addClass('active');
        }
    });
  $(document).on('click', function(e) {
  if (!$(e.target).closest(".selectable").length) {
         $('.selectable > .text').removeClass('close');
         $('.select > .text').removeClass('close');
        $('.selectable').removeClass('active');
        $('.select').removeClass('active');
  }
  e.stopPropagation();
});
    $(document).on('click', '.select input[type="radio"]', function(){
        var type = $(this).data('value');
        var count = $('.select-content .numeric input').val();
        $('.select .text').removeClass('close').text(type);
        $('.select').removeClass('active');
        $('.selectable > .text').text(count +' '+ type)

    });
    $(document).on('click', '.select-content .numeric a', function(){
        var type = $('.select input:checked').data('value');
        var count = parseInt($('.select-content .numeric input').val());
        if($(this).is('.plus')){
        	if( count < 5){
                $('.select-content .numeric input').val(count + 1);
                $('.selectable > .text').text(count + 1 +' '+ type);
        	}
        }
        if($(this).is('.minus')){
            if(count > 1){
                $('.select-content .numeric input').val(count - 1);
                $('.selectable > .text').text(count - 1 +' '+ type);
            }
        }

    });
    function content_size(){
        var window_height = $(window).height(),
            window_m = window_height * 1.4,
            margin = (window_m - window_height)/2;
        if( $(window).width() > 768){
            $('header .content').css({height: window_height});
            if(window_height > 800){
            $('#top').css({height: window_height});
            }else{
            $('#top').css({height: 800});
            }
            $('#call').css({height: window_height});
            $('#called').css({'height': window_height});
            if($('#how_it_works .content').height()+400 < window_height){
                $('#how_it_works').css({height: window_height});
            }else{
                $('#how_it_works').css({height: 'auto'});
            }
        }else{
            $('header .content').css({height: window_height});
            $('#top').css({height: window_height});
            $('#call').css({height: window_height});
            $('#called').css({'height': window_height * 1.4, 'marginTop': -margin});
        }
    }
    content_size();
    $(window).resize(function(){
        content_size();
    });
    $('#top, #free_quote').each(function(){
    if($(window).width() > 470){
       var dateFormat = "mm/dd/yy",
      from = $( "#from" )
        .datepicker({
          defaultDate: "+1w",
          changeMonth: true,
          numberOfMonths: 2
        })
        .on( "change", function() {
          to.datepicker( "option", "minDate", getDate( this ) );
        }),
      to = $( "#to" ).datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 2
      })
      .on( "change", function() {
        from.datepicker( "option", "maxDate", getDate( this ) );
      });

        function getDate( element ) {
          var date;
          try {
            date = $.datepicker.parseDate( dateFormat, element.value );
          } catch( error ) {
            date = null;
          }
          return date;
        }
    }else{
         $("#from").datepicker();
         $("#to").datepicker();
    }
        $('#fh3 .cloned .from').datepicker();
        $("#check-n1").on("change", function(){
            $('#fh1, #fh2, #to').show();
            $('#fh3').hide();
        });
        $("#check-n2").on("change", function(){
            $('#fh1, #fh2').show();
            $('#to, #fh3').hide();
        });
        $("#check-n3").on("change", function(){
            $('#fh3').show();
            $('#fh1, #fh2, #to').hide();
        });
        $("#fh3 .button a").on('click', function(){
            var clone=$('#fh3 .cloned:last').clone();
            clone.insertBefore('#fh3 .button');
            var attrs='form-' + clone.index();
            if($('#fh3 .cloned').length < 5){
                clone.find('.from').attr('id', attrs);
                $('#'+ attrs).val('').removeClass('hasDatepicker').datepicker();
            }else{
                clone.find('.from').attr('id', attrs);
                $('#'+ attrs).val('').removeClass('hasDatepicker').datepicker();
                $('#fh3 .button').hide();
            }

            return false;
        });
        $(document).on('click', '#fh3 .cloned .clos', function(){
            if($('#fh3 .cloned').length > 2){
            $(this).parent().remove();
            }
            if($('#fh3 .cloned').length < 5){
                $('#fh3 .button').show();
            }
        })
        $('#top .menu a').on('click', function(){
            $('#top .menu a').removeClass('active');
            $(this).addClass('active');
            if($(this).is('.oneway')){
                $('#to').attr('disabled', 'disabled')
            }else{
                $('#to').removeAttr('disabled');
            }
            return false;
        });
    });
    $('#how_it_works .logos').each(function(){
        $('#how_it_works .logos ul').owlCarousel({
            margin:10,
            nav:false,
            responsive:{
                0:{
                    loop:true,
                    items:1,
                    autoplay:true
                },
                600:{
                    loop:true,
                    items:3
                },
                1000:{
                    items:6
                }
            }
        });
    });
    $('#reviews').each(function(){
        $('#reviews .content ul').owlCarousel({
            loop:true,
            margin:10,
            nav:true,
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:2
                },
                1000:{
                    items:3
                },
                1600:{
                    margin:30,
                    items:3
                }
            }
        });
    });

    $('#offers_slider').each(function(){
        $('#offers_slider ul').owlCarousel({
            margin:10,
            nav:true,
            loop:true,
            autoplay:false,
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:2
                },
                1000:{
                    items:3
                },
                1600:{
                    margin:30,
                    items:3
                }
            }
        });
    });
    $(window).scroll(function(){
      $('#call').each(function(){
        if ($(this).offset().top < $(window).scrollTop()+$(window).height()) {
          var difference = $(window).scrollTop() - $(this).offset().top;
          var half = (difference / 2) + 'px';
          $(this).find('video').css('top', half);
          $(this).find('.content').css('marginBottom', half/2);
        } else {
          $(this).find('video').css('top', '-'+half);
        }
      });

    });

    $('#timer').animate({width:'20%'}, 1500,
        function(){
            $('#timer').animate({width:'40%'}, 3500,
                function(){
                     $('#timer').animate({width:'70%'}, 1500,
                    function(){
                         $('#timer').animate({width:'100%'}, 750,
                        function(){
                            $(location).attr('href', 'get_free_quote.html');
                         });
                     });
            });
        });
    $('#how').on('click', function(){
        $('#how_to_work_popup').show();
        return false;
    });
    $('#how_to_work_popup .close').on('click', function(){
      $('#how_to_work_popup').hide();
        return false;
    })
    $('#offers').each(function(){
       $('#offers .offer-tabs .tab').on('click', function(){
           var clas = $(this).children('span').text();
           $(this).parent().children().removeClass('active');
           $(this).addClass('active');
           $(this).closest('.offer').find('ul').removeClass('active');
           $(this).closest('.offer').find('ul.'+clas).addClass('active');
           $(this).closest('.offer').find('.title').removeClass('active');
           $(this).closest('.offer').find('.title.'+clas).addClass('active');
       });
       $('#offers .item_btn').on('click', function(){
           var title = $(this).find('.item-city').text(),
               price = $(this).find('.item-price').html();
           $('#free_quote .left .title').html(title);
           $('#free_quote .left .price').html(price);
           $('#offers_popup').show();
           return false;
       });
        $('#free_quote .closes').on('click', function(){
           $('#offers_popup').hide();
           return false;
        });
        $('#offers .panel-heading .panel-title a').on('click', function(){
            if($(this).closest('.offer').find('.panel-collapse').is('.collapse')){
                $('#offers .panel-collapse').addClass('collapse');
                $(this).closest('.offer').find('.panel-collapse').removeClass('collapse');
            }else{
                $(this).closest('.offer').find('.panel-collapse').addClass('collapse');
            }
           return false;
        });
        $('#offers .offer ul').each(function() {
           $(this).find('li:gt(6)').wrapAll('<div class="mobile-clossed">'); // скрыть те элементы, индекс которых больше 2
        });
        $('#offers .default-btn').on('click', function(){
            if($(this).closest('.offer').find('.mobile-clossed').is('.show')){
                $(this).text('show all');
                $(this).closest('.offer').find('.mobile-clossed').removeClass('show');
            }else{
                $(this).text('show less');
                $(this).closest('.offer').find('.mobile-clossed').addClass('show');
            }
            return false;
        });

    });
    $('#fast_quite').each(function(){
        $("#phone").intlTelInput();
         $('#fast_quite .fast-button').on('click', function(){
            if($('#fast_quite_form').is('.active')){
               $('#fast_quite_form').removeClass('active');
               $('#fast_quite').removeClass('active');
            }else{
                $('#fast_quite_form').addClass('active');
                $('#fast_quite').addClass('active');
            }
             return false;
         });
        $('#fast_quite .close, #fast_quite_form_bg').on('click', function(){
               $('#fast_quite_form').removeClass('active');
               $('#fast_quite').removeClass('active');
            $('#fast_quite_form .first').show();
            $('#fast_quite_form .thank').hide();
            $('#fast_quite_form form').show();
             return false;
        });
        $('#fast_quite_form form').submit(function(){
            $(this).hide();
            $('#fast_quite_form .first').hide();
            $('#fast_quite_form .thank').show();
           return false;
        });
    })

});