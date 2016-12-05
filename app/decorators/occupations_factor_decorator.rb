class OccupationsFactorDecorator < BaseDecorator
  def display_name
    object.factor.name
  end

  def condition
    "#{OccupationsFactor::CONDITION_MAP[object.predicate.to_sym]} #{object.value}"
  end
end
