# frozen_string_literal: true

class UsersResultDecorator < BaseDecorator
  def created_at
    I18n.l object.created_at, format: :date
  end

  def completed_at
    I18n.l(object.completed_at, format: :date) if object.completed_at
  end

  def started_at
    I18n.l(object.user_assessment.started_at, format: :date) if object.user_assessment.started_at
  end

  def completed_at_with_time
    object.completed_at.try(:strftime, '%F %T')
  end

  def started_at_with_time
    object.user_assessment.started_at.try(:strftime, '%F %T')
  end

  def display_name
    'UserResult'
  end

  def selected_locale
    return nil unless object.completed_at

    locale = object.user_assessment.selected_locale || I18n.default_locale
    I18n.t("languages.#{locale}", locale: I18n.default_locale)
  end

  def status
    I18n.t("activerecord.attributes.users_result.statuses.#{object.status}")
  end
end
