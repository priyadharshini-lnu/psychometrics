# frozen_string_literal: true

module FormHelper
  def flash_messages(dismissable = true)
    out         = []
    flash_types = { 'success' => 'success', 'error' => 'danger', 'notice' => 'info', 'alert' => 'warning' }
    flash.delete('timedout')
    flash.delete('resent')
    flash.each do |key, value|
      class_flash = flash_types[key] || 'danger'
      concat alert_panel(value, class_flash, dismissable)
    end
    out.join.html_safe
  end

  def flash_json_messages
    flash.to_hash.except('timedout', 'resent').map do |key, value|
      { type: key, value: value }
    end
  end

  def errors_for(form, field)
    content_tag(:div, form.object.errors[field].try(:first), class: 'help-block')
  end

  def form_group_for(form, field, options = {}, &)
    label = options.fetch(:label, false)
    has_errors = form.object.errors[field].present?
    klass = [field.to_s, 'form-group']
    klass.push(options.fetch(:class, ''))
    klass.push('has-error') if has_errors

    content_tag :div, class: klass.compact_blank.join(' ') do
      concat form.label(field, class: 'control-label') if label
      concat capture(&)
      concat errors_for(form, field) if has_errors
    end
  end
end
