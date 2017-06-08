class ClientDecorator < BaseDecorator
  def type
    I18n.t("activerecord.attributes.client.types.#{object.type}")
  end

  def status_confirmation
    status = object.disabled? ? 'enable' : 'disable'
    {
        title: I18n.t("administration.clients.resource.confirmations.#{status}.title", name: display_name),
        body: I18n.t("administration.clients.resource.confirmations.#{status}.body")
    }.to_json
  end

  def delete_confirmation
    {
        title: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.delete.title", name: display_name),
        body: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.delete.body")[object.depth]
    }.to_json
  end

  def archive_confirmation
    {
        title: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.archive.title", name: display_name),
        body: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.archive.body")[object.depth]
    }.to_json
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
    object.child? ? object.path.map { |anc| anc.decorate.display_name }.join(' > ') : display_name
  end

  def status
    object.archived? ? I18n.t('administration.clients.base.archived') : I18n.t('administration.clients.base.active')
  end

  def client_admins
    client_admins_memberships.map do |membership|
      h.link_to membership.user.decorate.display_name, h.edit_administration_client_user_path(membership.client_id, membership)
    end.join('<br>').html_safe
  end

  def projects_admins
    object.projects_admins.map { |user| h.content_tag(:span, user.decorate.display_name, class: 'text-nowrap') }.join('<br>').html_safe
  end

  def client_admins_memberships
    if object.tenancy?
      object.projects.map { |project| project.admin_memberships }.reject(&:empty?).flatten
    else
      object.admin_memberships
    end
  end

  def array_project_admins
    client_admins_memberships.map { |membership| membership.user.decorate.display_name }
  end

  def reports
    object.reports.map do |report|
      h.link_to report.decorate.display_name, h.administration_report_path(report)
    end.join(', ').html_safe
  end

  def array_reports
    object.reports.map { |report| report.decorate.display_name }
  end

  def url
    h.link_to "#{object.subdomain}.#{Settings.domain}", h.root_url(domain: Settings.domain, subdomain: object.subdomain), target: :blank
  end

  def actual_usage
    # todo investigate to ancestry
    object.license_usages.size + descendants.reduce(0){|sum,child| sum + child.license_usages.size}
  end
end
