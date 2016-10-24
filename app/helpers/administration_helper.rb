module AdministrationHelper
  def flash_messages
    out         = []
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

  #
  # Generate link with confirmation
  # Inherit rails confirmation behaviour
  # Custom data:
  # data-confirm - modal title
  # data-content - modal content
  # data-icon - modal icon
  #
  # Example:
  # ```
  #  = confirmation_link destroy_administrator_session_path, method: :delete,
  # data: {confirm: t('.sign_out_message.body'), title: t('.sign_out_message.title'), icon: 'fa-sign-out' } do
  #    span.fa.fa-sign-out
  # ```
  #
  def confirmation_link(name = nil, options = nil, html_options = nil, &block)
    link_to name, options, html_options, &block
  end

  #
  # Generate th with sortable link
  # Provided by filterrific (more https://github.com/jhund/filterrific)
  #
  # Example:
  # ```
  #  = sorting User, :name, @filterrific
  # ```
  #
  def sorting(resource_class, name, filterrific)
    label = resource_class.human_attribute_name(name)
    # extract the sort direction from the param value.
    klass = 'sorting'
    klass = filterrific.sorted_by =~ /desc$/ ? 'sorting_desc' : 'sorting_asc' if filterrific.sorted_by =~ /#{name}/
    content_tag :div, class: klass do
      filterrific_sorting_link(filterrific, name, { ascending_indicator: '', descending_indicator: '', label: label })
    end
  end

  def link_to_sort(resource_class, name, filter_form)
    sort_link(filter_form, name, resource_class.human_attribute_name(name))
  end
end
