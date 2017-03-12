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
    object.child? ? object.self_and_ancestors.map { |anc| anc.decorate.display_name }.join(' > ') : display_name
  end

  def project_admins
    if object.tenancy?
      object.projects.map do |project|
        project.admin_memberships.map do |membership|
          h.link_to membership.user.decorate.display_name, h.edit_administration_client_user_path(project, membership)
        end
      end.join('<br>').html_safe
    else
      object.admin_memberships.map do |membership|
        h.link_to membership.user.decorate.display_name, h.edit_administration_client_user_path(client, membership)
      end.join('<br>').html_safe
    end
  end

  def reports
    object.reports.map do |report|
      h.link_to report.decorate.display_name, h.administration_report_path(report)
    end.join(', ').html_safe
  end
end
