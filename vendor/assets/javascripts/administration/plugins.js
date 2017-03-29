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
                $(".select:not(.multiselect-two-sides)").selectpicker();
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

        var feMultiselectTwoSides = function () {

          if($(".multiselect-two-sides").length > 0)
              $(".multiselect-two-sides").multiSelect();
          if($(".multiselect-two-sides-searchabel").length > 0) {
            $(".multiselect-two-sides-searchabel").multiSelect({
              selectableHeader: "<input type='text' class='form-control mbs' autocomplete='off' placeholder='Search...'>",
              selectionHeader: "<input type='text' class='form-control mbs' autocomplete='off' placeholder='Search...'>",
              afterInit: function(ms){
                var that = this,
                    $selectableSearch = that.$selectableUl.prev(),
                    $selectionSearch = that.$selectionUl.prev(),
                    selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
                    selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';

                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                .on('keydown', function(e){
                  if (e.which === 40){
                    that.$selectableUl.focus();
                    return false;
                  }
                });

                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                .on('keydown', function(e){
                  if (e.which == 40){
                    that.$selectionUl.focus();
                    return false;
                  }
                });
              },
              afterSelect: function(){
                this.qs1.cache();
                this.qs2.cache();
              },
              afterDeselect: function(){
                this.qs1.cache();
                this.qs2.cache();
              }
            })
          }
        }

        var feAddClear = function () {
          if($('.has_clear').length > 0)
            $('.has_clear').addClear();
        }

        var feDynamicSelectable = function () {
          $('select[data-dynamic-selectable-url][data-dynamic-selectable-target]').dynamicSelectable();
        }
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
                    feMultiselectTwoSides();
                    feAddClear();
                    feDynamicSelectable();
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

        // Summernote
        var uiSummernote = function(){
            /* Extended summernote editor */
            if($(".summernote").length > 0){
                $(".summernote").summernote({height: 250,
                                             codemirror: {
                                                mode: 'text/html',
                                                htmlMode: true,
                                                lineNumbers: true,
                                                theme: 'default'
                                              }
                });
            }
            /* END Extended summernote editor */

            /* Lite summernote editor */
            if($(".summernote_lite").length > 0){

                $(".summernote_lite").on("focus",function(){

                    $(".summernote_lite").summernote({height: 100, focus: true,
                                                      toolbar: [
                                                          ["style", ["bold", "italic", "underline", "clear"]],
                                                          ["insert",["link","picture","video"]]
                                                      ]
                                                     });
                });
            }
            /* END Lite summernote editor */

            /* Email summernote editor */
            if($(".summernote_email").length > 0){

                $(".summernote_email").summernote({
                                                  height: 300,
                                                  focus: false,
                                                  toolbar: [
                                                      ['style', ['bold', 'italic', 'underline', 'clear']],
                                                      ['font', ['strikethrough']],
                                                      ['fontsize', ['fontsize']],
                                                      ['color', ['color']],
                                                      ['para', ['ul', 'ol', 'paragraph']],
                                                      ['height', ['height']]
                                                  ]

                                                 });

            }
            /* END Email summernote editor */

        }// END Summernote



        return {
            init: function(){
                uiDatatable();
                uiRangeSlider();
                uiScroller();
                uiSummernote();
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
