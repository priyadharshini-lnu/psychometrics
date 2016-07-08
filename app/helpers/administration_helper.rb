module AdministrationHelper
  def flash_messages
    out = []
    flash_types = { 'success' => 'success', 'error' => 'danger', 'notice' => 'info' }
    flash.delete('timedout')
    flash.each do |key, value|
      class_flash = flash_types[key] ? "alert-#{flash_types[key]}" : 'alert-danger'
      out << "<div class=\"alert #{class_flash} alert-dismissible fade in\" role=\"alert\">"
      out << '<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">×</span>
        </button>'
      out << value.to_s
      out << '</div>'
    end
    out.join('').html_safe
  end
end
