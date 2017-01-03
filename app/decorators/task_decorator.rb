class TaskDecorator < BaseDecorator
  def planned_completed_at
    I18n.l object.planned_completed_at, format: :date if object.planned_completed_at
  end

  def status
    I18n.t("activerecord.attributes.task.statuses.#{object.overdue? ? 'overdue' : object.status}")
  end
end
