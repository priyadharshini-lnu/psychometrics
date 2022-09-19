# frozen_string_literal: true

class QuestionDecorator < BaseDecorator
  def has_assessment?
    object.questions.pluck(:assessment_id).compact.any?
  end

  def assessments_name
    object.questions.map(&:block).filter_map(&:assessment).uniq.map(&:name).join(', ')
  end
end
