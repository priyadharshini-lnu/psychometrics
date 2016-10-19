class AssessmentDecorator < BaseDecorator
  def category
    I18n.t("activerecord.attributes.assessment.categories.#{ Assessment::CATEGORIES.key(object.category) }")
  end

  def description
    object.description || I18n.t('assessments.decorator.no_description')
  end

  def timing
    object.timing ? "- #{object.timing}" : ''
  end
end
