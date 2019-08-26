class InnovationStylesFactorDecorator < BaseDecorator
  def display_name
    object.factor.name
  end

  def condition
    "#{InnovationStylesFactor::CONDITION_MAP[object.predicate.to_sym]} #{object.value}"
  end
end
