# frozen_string_literal: true

class InnovationStylesFactorDecorator < BaseDecorator
  def display_name
    object.factor.decorate.display_name
  end

  def condition
    "#{InnovationStylesFactor::CONDITION_MAP[object.predicate.to_sym]} #{object.value}"
  end
end
