class ClientDecorator < BaseDecorator
  def status_confirmation
    status = object.disabled? ? 'enable' : 'disable'
    {
      title: I18n.t("administration.clients.resource.confirmations.#{status}.title", name: display_name),
      body: I18n.t("administration.clients.resource.confirmations.#{status}.body")
    }.to_json
  end

  def licenses_expire
    return I18n.l(object.licenses_expire, format: :long) unless object.licenses_expire.nil?
    '-'
  end

  def resource_partial
    return 'administration/clients/resource' if tenancy?
    return 'administration/clients/projects/resource' if project?
    return 'administration/clients/projects/campaigns/resource' if campaign?
    return 'administration/clients/projects/campaigns/sub_campaigns/resource' if sub_campaign?
  end

  def subdomain_field
    if object.subdomain.present? && object.subtenancy?
      object.subdomain.split('.').first
    else
      object.subdomain
    end
  end

  def detach_from_project_confirmation
    {
        title: I18n.t('administration.projects.clients.confirmations.detach_from_project.title', name: display_name, project_name: context[:project_name]),
        body: I18n.t('administration.projects.clients.confirmations.detach_from_project.body')
    }.to_json
  end

  def display_name_with_parent
    parent_id ? "#{object.parent.decorate.display_name} / #{display_name}" : display_name
  end
end
