class DimensionDecorator < BaseDecorator
  def client_name
    object.owner.try(:name) || I18n.t('administration.tte')
  end
end
