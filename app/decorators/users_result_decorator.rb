# frozen_string_literal: true

class UsersResultDecorator < BaseDecorator
  def created_at
    I18n.l object.created_at, format: :date
  end

  def completed_at
    I18n.l(object.completed_at, format: :date) if object.completed_at
  end

  def started_at
    I18n.l(object.created_at, format: :date) if object.created_at
  end

  def display_name
    'UserResult'
  end

  def selected_locale
    nil
  end

  def status
    I18n.t("activerecord.attributes.users_result.statuses.#{object.status}")
  end
end
