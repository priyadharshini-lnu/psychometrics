class ApiKeyDecorator < BaseDecorator
  def display_name
    "#{object.user.decorate.display_name}'s API token"
  end

  def create_confirmation
    {
      title: I18n.t("administration.#{i18n}.resource.confirmations.create.title"),
      body: I18n.t("administration.#{i18n}.resource.confirmations.create.body")
    }.to_json
  end

  def i18n
    'clients.api_keys'
  end
end
