class FactorDecorator < BaseDecorator
  def sub_factors
    object.subfactors_count || 0
  end
  def questions
    object.questions_count || 0
  end
end
