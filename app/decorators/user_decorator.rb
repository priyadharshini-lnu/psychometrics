# frozen_string_literal: true

class UserDecorator < BaseDecorator
  def display_name
    return object.email if object.first_name.blank? && object.last_name.blank?

    "#{object.first_name} #{object.last_name}"
  end

  def full_name(seprator: ' ')
    [object.first_name, object.last_name].compact.join(seprator)
  end

  def can_manage_roles
    object.can_manage.map { |role| [User.human_role(role), role] }
  end

  def role
    if object.is?(:admin)
      I18n.t("activerecord.attributes.user.roles.#{object.memberships.pluck(:role).pop || 'assessor'}")
    else
      I18n.t("activerecord.attributes.user.roles.#{User::USER_ROLES.key(object.role)}")
    end
  end

  def admin_role
    return I18n.t('activerecord.attributes.user.roles.admins.project_admin') if object.is?(:project_admin)

    I18n.t("activerecord.attributes.user.roles.admins.#{User::USER_ROLES.key(object.role)}")
  end

  def change_password_confirmation
    {
      title: I18n.t(
        'administration.users.resource.confirmations.change_password.title',
        name: html_escaped_display_name
      ),
      body: I18n.t('administration.users.resource.confirmations.change_password.body')
    }.to_json
  end

  def clients_name
    if h.current_user.is?(:superadmin)
      object.clients.
        map { |client| client.decorate.html_escaped_display_name }.
        join(', ')
    else
      object.clients.
        select { |client| h.current_user.client_ids.include?(client.id) }.
        map { |client| client.decorate.html_escaped_display_name }.
        join(', ')
    end
  end

  def clients_hierarchy
    admin_levels = admin_end_level_hierarchy
    end_levels = []
    end_levels = client_end_level_hierarchy unless object.is?(:project_admin)
    end_levels.concat(clients_hierarchy_for_regular_user).join('<br/>')
    if object.is?(:client_admin) || object.is?(:superadmin)
      admin_levels.concat(client_admin_hierarchy_for_user).join('<br/>')
    end
    admin_levels.concat(assessor_hierarchy_for_user).join('<br/>') if object.assessors.any?
    admin_levels.concat(campaign_admin_hierarchy_for_user).join('<br/>') if object.is?(:campaign_admin)

    [admin_levels, end_levels].reject(&:empty?).join('<br/>').html_safe
  end

  def admin_end_level_hierarchy
    object.project_admin_clients.map do |client|
      path = h.administration_client_project_admins_path(client)
      path ||= h.administration_client_users_path(client)
      h.link_to client.decorate.html_escaped_display_name, path
    end
  end

  def campaign_admin_hierarchy_for_user
    object.campaign_admin_campaigns.map do |campaign|
      path = h.administration_project_new_campaign_path(campaign.project, campaign)
      h.link_to campaign.decorate.html_escaped_display_name, path
    end
  end

  def client_end_level_hierarchy
    object.clients.end_level.map do |client|
      clients_array = client.path.order(:id)
      whole_path = clients_array.filter_map do |c|
        next if c.tenancy?

        path = if c.campaign_level? || c.sub_campaign_level?
                 h.administration_client_project_campaigns_path(clients_array[0], c)
               elsif c.depth == 2 && clients_array[1].sub_campaign_level?
                 h.administration_client_project_campaign_sub_campaigns_path(clients_array[0], clients_array[1], c)
               end
        path ||= h.administration_client_users_path(c)
        h.link_to c.decorate.html_escaped_display_name, path
      end.join(' > ')
      "&#187; #{whole_path}"
    end
  end

  def assessor_hierarchy_for_user
    object.assessors.map do |assessor|
      "&#187; #{h.link_to(
        assessor.campaign.decorate.html_escaped_display_name, h.administration_project_new_campaign_path(
                                                                assessor.campaign.project, assessor.campaign
                                                              )
      )}"
    end
  end

  def client_admin_hierarchy_for_user
    object.client_admin_clients.map do |client|
      link = h.link_to(client.decorate.html_escaped_display_name, h.administration_client_client_admins_path(client))
      "&#187; #{link}"
    end
  end

  def clients_hierarchy_for_regular_user
    object.campaigns.includes(:project, :threesixty_campaign).map do |campaign|
      project = campaign.project
      client = campaign.client
      whole_path = [
        h.link_to(client.decorate.html_escaped_display_name, h.administration_client_client_admins_path(client)),
        h.link_to(
          project.decorate.html_escaped_display_name,
          h.administration_client_project_campaigns_path(client, project)
        ),
        h.link_to(campaign.decorate.html_escaped_display_name, campaign_path(campaign, project, client))
      ].join(' > ')
      "&#187; #{whole_path}"
    end
  end

  def campaign_path(campaign, project, client)
    if campaign.threesixty?
      return h.administration_client_project_threesixty_campaign_path(
        client,
        project,
        campaign.threesixty_campaign.id
      )
    end
    h.administration_project_new_campaign_path(project, campaign)
  end

  def delete_confirmation
    {
      title: I18n.t('administration.users.resource.confirmations.delete.title', name: html_escaped_display_name),
      body: I18n.t('administration.users.resource.confirmations.delete.body')
    }.to_json
  end

  def delete_membership_confirmation
    {
      title: I18n.t(
        'administration.users.resource.confirmations.membership.delete.title',
        name: html_escaped_display_name, client_name: h.html_escape(context[:client_name])
      ),
      body: I18n.t('administration.users.resource.confirmations.membership.delete.body')
    }.to_json
  end

  def toggle_status_confirmation
    status = object.disabled ? I18n.t('administration.enable') : I18n.t('administration.disable')
    {
      title: I18n.t(
        'administration.users.resource.confirmations.toggle_status.title',
        status: status,
        name: html_escaped_display_name
      ),
      body: I18n.t(
        'administration.users.resource.confirmations.toggle_status.body',
        status: status.downcase
      )
    }.to_json
  end

  def toggle_enable_2fa_confirmation
    status = object.enable_2fa? ? I18n.t('administration.disable') : I18n.t('administration.enable')
    {
      title: I18n.t(
        'administration.users.resource.confirmations.toggle_enable_2fa.title',
        status: status
      ),
      body: I18n.t(
        'administration.users.resource.confirmations.toggle_enable_2fa.body',
        name: html_escaped_display_name,
        status: status.downcase
      )
    }.to_json
  end

  def toggle_enable_2fa_text
    if object.enable_2fa?
      I18n.t('administration.users.toggle_enable_2fa.disable')
    else
      I18n.t('administration.users.toggle_enable_2fa.enable')
    end
  end

  def self.export_headers
    I18n.with_locale(I18n.default_locale) do
      [
        User.human_attribute_name('active'),
        User.human_attribute_name('first_name'),
        User.human_attribute_name('last_name'),
        User.human_attribute_name('email'),
        User.human_attribute_name('locale'),
        User.human_attribute_name('password'),
        User.human_attribute_name('overwrite_password'),
        User.human_attribute_name('schedule_start_date'),
        User.human_attribute_name('schedule_end_date'),
        User.human_attribute_name('created_at'),
        User.human_attribute_name('manager_email')
      ]
    end
  end
end
