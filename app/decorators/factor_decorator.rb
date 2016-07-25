class FactorDecorator < BaseDecorator

  def xls_factor_score_row(type)
    result = [object.root? ? nil : object.root.name, object.name]
    FactorsNorm::LEVELS.each do |level|
      current_factor_norm = object.factors_norms.where(level: level, type: type).first
      result << current_factor_norm.try(:score_from).try(:round, 5)
      result << current_factor_norm.try(:score_to).try(:round, 5)
    end
    result
  end
end
