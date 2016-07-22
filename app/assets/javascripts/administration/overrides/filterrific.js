// Define function to submit Filterrific filter form
window.Filterrific.submitFilterForm = function(){
  var form = $(this).is('form') ? $(this) : $(this).parents('form'),
      url = form.attr('action'),
      panel = $(this).parents('.panel');
  // Show spinner
  panel_refresh(panel);

  // Submit ajax request
  $.ajax({
    url: url,
    data: form.serialize(),
    type: 'GET',
    dataType: 'script'
  }).done(function( msg ) {
    panel_refresh(panel);
  });
};

window.Filterrific.initListener = function(){
  // Add change event handler to all Filterrific filter inputs.
  $('#filter').on(
    'change',
    ':input:not(.periodically-observed)',
    window.Filterrific.submitFilterForm
  );

  // Add periodic observer to selected inputs.
  // Use this for text fields you want to observe for change, e.g., a search input.
  $('.periodically-observed').filterrific_observe_field(
    0.5,
    window.Filterrific.submitFilterForm
  );
}

// Initialize event observers on document ready and turbolinks page:load
jQuery(document).on('ready page:load', window.Filterrific.initListener);

