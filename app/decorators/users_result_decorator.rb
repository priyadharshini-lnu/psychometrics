# frozen_string_literal: true

class UsersResultDecorator < BaseDecorator
  def created_at
    I18n.l object.created_at, format: :date
  end

  def completed_at
    I18n.l(object.completed_at, format: :date) if object.completed_at
  end

  def started_at
    I18n.l(object.started_at, format: :date) if object.started_at
  end

  def completed_at_with_time
    object.completed_at.try(:strftime, '%D %r')
  end

  def started_at_with_time
    object.started_at.try(:strftime, '%D %r')
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

  def self.export_headers
    [
      UsersResult.human_attribute_name('result_id'),
      User.human_attribute_name('name'),
      User.human_attribute_name('email'),
      UsersResult.human_attribute_name('assessment_type'),
      UsersResult.human_attribute_name('assessment_name'),
      UsersResult.human_attribute_name('started_at'),
      UsersResult.human_attribute_name('completed_at'),
      UsersResult.human_attribute_name('status')
    ]
  end
end
