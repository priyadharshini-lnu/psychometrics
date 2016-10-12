class AssessmentDecorator < BaseDecorator
  def category
    Assessment.human_category(object.category)
  end

  def description
    object.description || I18n.t('assessments.decorator.no_description')
  end
end
