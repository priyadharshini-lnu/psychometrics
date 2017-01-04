class CommunicationDecorator < BaseDecorator
  def display_name
    object.subject
  end

  def client_name
    object.owner.try(:name) || I18n.t('administration.tte')
  end
end
