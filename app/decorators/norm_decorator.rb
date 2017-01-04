class NormDecorator < BaseDecorator
  def updater
    object.updater.try(:decorate).try(:display_name)
  end

  def xls_levels_row
    levels = []
    FactorsNorm::LEVELS.each do |level|
      levels << level
      levels << nil
    end
    levels
  end

  def client_name
    object.owner.try(:name) || I18n.t('administration.tte')
  end
end
