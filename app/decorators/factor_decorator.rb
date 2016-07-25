class FactorDecorator < BaseDecorator
  def xls_factor_score_row(type)
    result = [nil, object.name]
    FactorsNorm::LEVELS.each do |level|
      current_factor_norm = object.factors_norms.where(level: level, type: type).first
      result << current_factor_norm.try(:score_from)
      result << current_factor_norm.try(:score_to)
    end
    result
  end

  def xls_subfactor_score_row(type)
    result = [object.root.name, object.name]
    FactorsNorm::LEVELS.each do |level|
      current_factor_norm = object.factors_norms.where(level: level, type: type).first
      result << current_factor_norm.try(:score_from)
      result << current_factor_norm.try(:score_to)
    end
    result
  end
end
