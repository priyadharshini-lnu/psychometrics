# frozen_string_literal: true

class OccupationsFactorDecorator < BaseDecorator
  def display_name
    object.factor.decorate.display_name
  end

  def condition
    "#{OccupationsFactor::CONDITION_MAP[object.predicate.to_sym]} #{object.value}"
  end
end
