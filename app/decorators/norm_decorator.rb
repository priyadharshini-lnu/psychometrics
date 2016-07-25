class NormDecorator < BaseDecorator
  def updater
    object.updater.try(:decorate).try(:display_name)
  end

  def xls_levels_row
    levels = [nil, nil]
    FactorsNorm::LEVELS.each do |level|
      levels << level
      levels << nil
    end
    levels
  end
end
