class QuestionDecorator < BaseDecorator
  def assessments_name
    object.questions.map(&:block).map(&:assessment).uniq.map(&:name).join(', ')
  end
end
