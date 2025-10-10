# frozen_string_literal: true

module CommunicationsHelper
  def date_without_seconds_and_timezone(date = DateTime.current)
    I18n.l(date, format: :iso8601_without_seconds_and_timezone)
  end

  def render_selected_recipient_users(communication)
    return nil unless communication.assessment_center_booking_summary?

    users = communication.communications_users.map(&:user)
    return nil if users.blank?

    options = users.map { |user| ["#{user.name} (#{user.email})", user.id] }
    select_tag(:recipients,
               options_for_select(options),
               class: 'form-control',
               multiple: true)
  end
end
