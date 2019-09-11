# frozen_string_literal: true

class AssignDecorator < BaseDecorator
  def initialize(object, options = {})
    object = object.project_assign || object
    super
  end

  def created_at
    I18n.l object.created_at, format: :date
  end

  def completed_at_with_desc
    if object.completed_at
      return I18n.t('assigns.decorator.completed', date: I18n.l(object.completed_at, format: :date))
    end

    I18n.t('assigns.decorator.not_completed')
  end

  def completed_at
    I18n.l(object.completed_at, format: :date) if object.completed_at
  end

  def display_name
    'Assign'
  end

  def status
    I18n.t("activerecord.attributes.assign.statuses.#{object.status}")
  end
end
