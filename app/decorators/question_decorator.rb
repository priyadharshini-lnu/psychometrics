class QuestionDecorator < BaseDecorator
  def assessments_name
    object.questions.map(&:block).map(&:assessment).compact.uniq.map(&:name).join(', ')
  end

  def client_name
    object.owner.try(:name) || I18n.t('administration.tte')
  end
end
