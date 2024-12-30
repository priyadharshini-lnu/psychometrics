# frozen_string_literal: true

module AdminJobs
  class ExportAdminsWithPermissions < BaseExportCsv
    def generate_details
      [['File', file_link]]
    end

    private

    def headers
      [
        'Membership ID',
        'Email',
        'Role',
        'Client ID',
        'Client Name',
        'Project ID',
        'Project Name',
        'Campaign ID',
        'Campaign Name',
        *permission_headers
      ]
    end

    def permission_headers
      AllowedPermissions::CLIENT_ADMIN_PERMISSIONS.flat_map do |key, values|
        values.map { |value| "#{key.titleize} - #{value.titleize}" }
      end
    end

    def data_row(membership)
      membership_client = membership.client
      campaign = membership.campaign
      project = membership_client.project? ? membership_client : nil
      project ||= campaign ? campaign.project : nil
      client = membership_client.tenancy? ? membership_client : project&.client
      [
        membership.id,
        membership.user.email,
        membership.role.titleize,
        client.id,
        client.name,
        project&.id,
        project&.name,
        campaign&.id,
        campaign&.name,
        *permissions_for_membership(membership)
      ]
    end

    def permissions_for_membership(membership)
      AllowedPermissions::CLIENT_ADMIN_PERMISSIONS.flat_map do |key, values|
        values.map do |value|
          grants = membership.grants
          next 'False' unless grants

          grants.data[key]&.include?(value) ? 'True' : 'False'
        end
      end
    end

    def records_for_export
      project_admin_role = Membership.roles['project_admin']
      client_admin_role = Membership.roles['client_admin']
      campaign_admin_role = Membership.roles['campaign_admin']

      Membership.where(
        '(
          memberships.client_id IN (:client_ids) AND
          memberships.role IN (:project_admin_role, :client_admin_role)
        ) OR (
          memberships.campaign_id IN (:campaign_ids) AND memberships.role = :campaign_admin_role
        )',
        client_ids: client_ids,
        campaign_ids: campaign_ids,
        project_admin_role: project_admin_role,
        client_admin_role: client_admin_role,
        campaign_admin_role: campaign_admin_role
      ).includes(:user, :campaign, :client, :grants).find_each(batch_size: 100)
    end

    def file_name
      "admins-with-permissions-#{entity&.id}-#{record.id}.csv"
    end

    def disable_data_processing?
      privacy_setting&.disable_data_processing?
    end

    def client_ids
      @client_ids ||= project.present? ? project_ids : [client&.id, *project_ids].compact
    end

    def project_ids
      return [] if campaign.present?

      @project_ids ||= project.present? ? [project.id] : filtered_project_ids
    end

    def campaign_ids
      @campaign_ids ||= campaign.present? ? [campaign.id] : Campaign.where(project_id: project_ids).pluck(:id)
    end

    def filtered_project_ids
      return [] if disable_data_processing?

      @filtered_project_ids ||= Project.
                                where(tte_id: client&.id).
                                joins(:privacy_setting).
                                where(privacy_settings: { disable_data_processing: false }).
                                pluck(:id)
    end

    def privacy_setting
      return nil if campaign.present?

      project&.privacy_setting || client.client_privacy_setting
    end

    def entity
      campaign || project || client
    end
  end
end
