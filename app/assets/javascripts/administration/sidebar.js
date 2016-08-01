$(function(){
  //// Init Sidebars
  $('#sidebar').sidebar({side: 'right'});

  // Close sidebar by click to button
  $(document).on('click', '#sidebar .close', function(e){
    e.preventDefault();
    $(document).trigger('close_sidebar');
  });

  // Stop propagation, when clicked to action dom
  $(document).on('click', 'table.selectable tbody tr[data-sidebar] a', function(event){
    event.stopPropagation();
  });

  $(document).on('click', 'table.selectable tbody tr[data-sidebar]', function(event){
    event.stopPropagation();
    $(document).trigger('load_sidebar', [this]);
  });

  // Close sidebar when click not to table
  // $(document).on('click', 'body, table.selectable thead a', function(event){
  //   $(document).trigger('close_sidebar');
  // });

  // Load sidebar
  $(document).on('load_sidebar', function(e, resource){
    var $resource = $(resource),
        url = $resource.data('sidebar'),
        $panel = $('#sidebar .panel');

    // Remove active class from other active tr
    $resource.closest('tbody').
              find('.active').
              removeClass('active');

    // Add active class to clicked tr
    $resource.addClass('active');

    // Open sidebar
    $('#sidebar').trigger("sidebar:open").
                  addClass('opened');

    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'script',
      beforeSend: function(){
        panel_refresh($panel);
      },
      complete: function(){
        panel_refresh($panel);
      }
    });
  });

  // Close sidebar
  $(document).on('close_sidebar', function(event) {
    $('#sidebar').trigger("sidebar:close").
                  removeClass('opened').
                  find('.content').html('');
    $('table.selectable tbody tr.active').removeClass('active');
  });
});
