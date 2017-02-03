class AssignDecorator < BaseDecorator
  def status
    I18n.t("activerecord.attributes.assign.statuses.#{object.status}")
  end

  def created_at
    I18n.l object.created_at, format: :date
  end

  def completed_at_with_desc
    return I18n.t('assigns.decorator.completed', date: I18n.l(object.completed_at, format: :date)) if object.completed_at
    I18n.t('assigns.decorator.not_completed')
  end

  def completed_at
    I18n.l(object.completed_at, format: :date) if object.completed_at
  end

  def display_name
    'Assign'
  end

  def status
    I18n.t("activerecord.attributes.assign.statuses.#{ object.status }")
  end
end
