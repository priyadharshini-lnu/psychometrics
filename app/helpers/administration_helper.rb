module AdministrationHelper
  def flash_messages
    out         = []
    flash_types = { 'success' => 'success', 'error' => 'danger', 'notice' => 'info' }
    flash.delete('timedout')
    flash.each do |key, value|
      class_flash = flash_types[key] || 'danger'
      concat alert_panel(value, class_flash)
    end
    out.join('').html_safe
  end

  def alert_panel(message, type = 'warning')
    content_tag :div, class: "alert alert-#{type} alert-dismissible", role: 'alert' do
      concat content_tag(:button, content_tag(:span, '&times;'.html_safe), class: 'close', data: { dismiss: 'alert' })
      concat h(message)
    end
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
    klass = filterrific.sorted_by.match?(/desc$/) ? 'sorting_desc' : 'sorting_asc' if filterrific.sorted_by.match?(/#{name}/)
    content_tag :div, class: klass do
      filterrific_sorting_link(filterrific, name, { ascending_indicator: '', descending_indicator: '', label: label })
    end
  end

  def link_to_sort(_resource_class, name, filter_form, tail = nil)
    unless tail
      case name
      when :created_at, :updated_at
        tail = Settings.timezone_tip
      else
        tail = ''
      end
    end
    sort_link(filter_form, name, t(".#{name}") + tail)
  end

  def render_error_notification(resource)
    return unless resource.errors.any?
    content_tag :div, class: 'alert alert-danger' do
      concat content_tag 'strong', 'There are some problems:'
      concat content_tag 'ul', resource.errors.full_messages.map { |msg| content_tag('li', msg) }.join.html_safe, class: 'list-unstyled'
    end
  end

  def time_for_communication_timepicker
    Time.current.strftime('%I:%M %p')
  end

  def assessments_options_for_select(assessments, report = nil)
    assessments.all.map do |a|
      disabled = report && (report.assigns_reports.any? || report.clients_reports.any?)
      data = { mindmill: a.mindmill?, hogan: a.hogan?, psychometric: a.psychometric? }
      [a.decorate.display_name, a.id, { disabled: disabled, data: data }]
    end
  end

  def reports_for_assessment(assessment)
    client.reports.joins(:assessments_reports).where(assessments_reports: { assessment_id: assessment.id }).distinct
  end
end
