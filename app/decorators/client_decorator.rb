class ClientDecorator < BaseDecorator
  def status_confirmation
    status = object.disabled? ? 'enable' : 'disable'
    {
      title: I18n.t("administration.clients.resource.confirmations.#{status}.title", name: display_name),
      body: I18n.t("administration.clients.resource.confirmations.#{status}.body")
    }.to_json
  end

  def licenses_used
    "#{object.licenses_used} / #{object.licenses}"
  end

  def licenses_expire
    return I18n.l(object.licenses_expire, format: :long) unless object.licenses_expire.nil?
    '-'
  end
end
