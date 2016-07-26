class FactorDecorator < BaseDecorator
  def factor_score_row(type)
    if object.root?
      result = [object.name]
    else
      result = [object.root.name, object.name]
    end
    # TODO: optimize after elaborate of levels (use 1 query instead 5, sort through ruby, or add queue logic in DB)
    FactorsNorm::LEVELS.each do |level|
      current_factor_norm = object.factors_norms.where(level: level, type: type).first
      result << current_factor_norm.try(:score_from).try(:round, 5)
      result << current_factor_norm.try(:score_to).try(:round, 5)
    end
    result
  end
end
