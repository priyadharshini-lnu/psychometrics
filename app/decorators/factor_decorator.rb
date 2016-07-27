class FactorDecorator < BaseDecorator
  def factor_score_row(type)
    result = object.root? ? [value: object.name] : [{ value: object.root.name }, { value: object.name }]
    # TODO: optimize after elaborate of levels (use 1 query instead 5, sort through ruby, or add queue logic in DB)
    FactorsNorm::LEVELS.each do |level|
      current_factor_norm = object.factors_norms.where(level: level, type: type).first
      result << { id: current_factor_norm.id, name: :score_from, value: current_factor_norm.try(:score_from).try(:round, 5) }
      result << { id: current_factor_norm.id, name: :score_to, value: current_factor_norm.try(:score_to).try(:round, 5) }
    end
    result
  end
end
