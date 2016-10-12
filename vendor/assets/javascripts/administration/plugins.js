$(function() {

    window.formElements = function(){
        // Bootstrap datepicker
        var feDatepicker = function(){
            if($(".datepicker").length > 0){
                $(".datepicker").datepicker({format: 'yyyy-mm-dd'});
                $("#dp-2,#dp-3,#dp-4").datepicker(); // Sample
            }

        }// END Bootstrap datepicker

        //Bootstrap timepicker
        var feTimepicker = function(){
            // Default timepicker
            if($(".timepicker").length > 0)
                $('.timepicker').timepicker();

            // 24 hours mode timepicker
            if($(".timepicker24").length > 0)
                $(".timepicker24").timepicker({minuteStep: 5,showSeconds: true,showMeridian: false});

        }// END Bootstrap timepicker

        //Daterangepicker
        var feDaterangepicker = function(){
            if($(".daterange").length > 0)
               $(".daterange").daterangepicker({format: 'YYYY-MM-DD',startDate: '2013-01-01',endDate: '2013-12-31'});
        }
        // END Daterangepicker

        //Bootstrap colopicker
        var feColorpicker = function(){
            if($(".colorfield").length > 0)
                $(".colorfield").colorpicker();
        }
        // END Bootstrap colorpicker

        //Bootstrap select
        var feSelect = function(){
            if($(".select").length > 0){
                $(".select").selectpicker();
            }
        }//END Bootstrap select


        //Bootstrap tooltip
        var feTooltips = function(){
            $("body").tooltip({selector:'[data-toggle="tooltip"]',container:"body"});
        }//END Bootstrap tooltip

        //Bootstrap Popover
        var fePopover = function(){
            $("[data-toggle=popover]").popover();
            $(".popover-dismiss").popover({trigger: 'focus'});
        }//END Bootstrap Popover

        //iCheckbox and iRadion - custom elements
        var feiCheckbox = function(){
            if($(".icheckbox").length > 0){
                 $(".icheckbox,.iradio").iCheck({checkboxClass: 'icheckbox_minimal-grey',radioClass: 'iradio_minimal-grey'});
            }
        }
        // END iCheckbox

        //Bootstrap file input
        var feBsFileInput = function(){

            if($("input.fileinput").length > 0)
                $("input.fileinput").bootstrapFileInput();

        }
        //END Bootstrap file input

        return {// Init all form element features
		init: function(){
                    feDatepicker();
                    feTimepicker();
                    feColorpicker();
                    feSelect();
                    feTooltips();
                    fePopover();
                    feiCheckbox();
                    feDaterangepicker();
                }
        }
    }();

    window.uiElements = function(){

        //Datatables
        var uiDatatable = function(){
            if($(".datatable").length > 0){
                $(".datatable").dataTable();
                $(".datatable").on('page.dt',function () {
                    onresize(100);
                });
            }

            if($(".datatable_simple").length > 0){
                $(".datatable_simple").dataTable({"ordering": false, "info": false, "lengthChange": false,"searching": false});
                $(".datatable_simple").on('page.dt',function () {
                    onresize(100);
                });
            }
        }//END Datatable

        //RangeSlider // This function can be removed or cleared.
        var uiRangeSlider = function(){

            //Default Slider with start value
            if($(".defaultSlider").length > 0){
                $(".defaultSlider").each(function(){
                    var rsMin = $(this).data("min");
                    var rsMax = $(this).data("max");

                    $(this).rangeSlider({
                        bounds: {min: 1, max: 200},
                        defaultValues: {min: rsMin, max: rsMax}
                    });
                });
            }//End Default

            //Date range slider
            if($(".dateSlider").length > 0){
                $(".dateSlider").each(function(){
                    $(this).dateRangeSlider({
                        bounds: {min: new Date(2012, 1, 1), max: new Date(2015, 12, 31)},
                        defaultValues:{min: new Date(2012, 10, 15),max: new Date(2014, 12, 15)}
                    });
                });
            }//End date range slider

            //Range slider with predefinde range
            if($(".rangeSlider").length > 0){
                $(".rangeSlider").each(function(){
                    var rsMin = $(this).data("min");
                    var rsMax = $(this).data("max");

                    $(this).rangeSlider({
                        bounds: {min: 1, max: 200},
                        range: {min: 20, max: 40},
                        defaultValues: {min: rsMin, max: rsMax}
                    });
                });
            }//End

            //Range Slider with custom step
            if($(".stepSlider").length > 0){
                $(".stepSlider").each(function(){
                    var rsMin = $(this).data("min");
                    var rsMax = $(this).data("max");

                    $(this).rangeSlider({
                        bounds: {min: 1, max: 200},
                        defaultValues: {min: rsMin, max: rsMax},
                        step: 10
                    });
                });
            }//End

        }//END RangeSlider


        // Custom Content Scroller
        var uiScroller = function(){

            if($(".scroll").length > 0){
                $(".scroll").mCustomScrollbar({axis:"y", autoHideScrollbar: true, scrollInertia: 20, advanced: {autoScrollOnFocus: false}});
            }

        }// END Custom Content Scroller


        return {
            init: function(){
                uiDatatable();
                uiRangeSlider();
                uiScroller();
            }
        }

    }();

    window.templatePlugins = function(){

        var tp_clock = function(){

            function tp_clock_time(){
                var now     = new Date();
                var hour    = now.getHours();
                var minutes = now.getMinutes();

                hour = hour < 10 ? '0'+hour : hour;
                minutes = minutes < 10 ? '0'+minutes : minutes;

                $(".plugin-clock").html(hour+"<span>:</span>"+minutes);
            }
            if($(".plugin-clock").length > 0){

                tp_clock_time();

                window.setInterval(function(){
                    tp_clock_time();
                },10000);

            }
        }

        var tp_date = function(){

            if($(".plugin-date").length > 0){

                var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

                var now     = new Date();
                var day     = days[now.getDay()];
                var date    = now.getDate();
                var month   = months[now.getMonth()];
                var year    = now.getFullYear();

                $(".plugin-date").html(day+", "+month+" "+date+", "+year);
            }

        }

        return {
            init: function(){
                tp_clock();
                tp_date();
            }
        }
    }();


    window.formElements.init();
    window.uiElements.init();
    window.templatePlugins.init();

    // New selector case insensivity
     $.expr[':'].containsi = function(a, i, m) {
         return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
     };
});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
