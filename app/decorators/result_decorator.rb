# frozen_string_literal: true

class ResultDecorator < BaseDecorator
  def status
    I18n.t("activerecord.attributes.results.statuses.#{object.status}")
  end

  def completed_at_with_desc
    if object.completed_at && object.completed?
      return I18n.t(
        'results.decorator.completed',
        date: I18n.l(object.completed_at,
                     format: :date)
      )
    end

    I18n.t('results.decorator.not_completed')
  end

  def completed_at
    I18n.l(object.completed_at, format: :date) if object.completed_at
  end

  # Related status by project status
  def related_status(project_status)
    result_status = object.status if project_status == 'in_progress'
    result_status = 'not_started' if project_status == 'not_started'
    result_status = 'overdue' if project_status == 'completed' && object.status != 'completed'
    result_status = 'completed' if project_status == 'completed' && object.completed?
    I18n.t("assigns.assessment.status.#{result_status}")
  end
end
