$(function(){
  //// Init Sidebars
  $('#sidebar').sidebar({side: 'right'});

  // Close sidebar by click to button
  $(document).on('click', '#sidebar .close', function(e){
    e.preventDefault();
    $('#sidebar').trigger("sidebar:close").
                  removeClass('opened').
                  find('.content').html('');
  });

  $(document).on('click', 'table.selectable tbody tr', function(e){
      if ($(e.target).prop('tagName') == 'A') {
          return;
      }
    $(document).trigger('load_sidebar', [this]);
  });

  // Load sidebar
  $(document).on('load_sidebar', function(e, resource){
    var $resource = $(resource),
        url = $resource.data('sidebar');

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
      dataType: 'script'
    });
  });
});
