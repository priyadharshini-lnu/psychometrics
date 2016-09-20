class QuestionDecorator < BaseDecorator
  def assessments_name
    object.questions.map(&:block).map(&:assessment).compact.uniq.map(&:name).join(', ')
  end
end
