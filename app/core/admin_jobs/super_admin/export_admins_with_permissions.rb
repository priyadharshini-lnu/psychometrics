# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
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
        project_ids = filtered_project_ids
        client_ids = [client.id, *project_ids]
        campaign_ids = Campaign.where(project_id: project_ids).pluck(:id)
        Membership.where(
          %{
            (
              memberships.client_id IN (:client_ids) AND
              memberships.role IN (#{Membership.roles['project_admin']}, #{Membership.roles['client_admin']})
            )
            OR (memberships.campaign_id IN (:campaign_ids) AND memberships.role = #{Membership.roles['campaign_admin']})
          },
          client_ids: client_ids, campaign_ids: campaign_ids
        ).includes(:user, :campaign, :client, :grants).find_each(batch_size: 100)
      end

      def file_name
        "admins-with-permissions-#{client.id}-#{record.id}.csv"
      end

      def disable_data_processing?
        client.client_privacy_setting.disable_data_processing?
      end

      def filtered_project_ids
        return [] if disable_data_processing?

        @filtered_project_ids ||= Project.
                                  where(tte_id: client.id).
                                  joins(:privacy_setting).
                                  where(privacy_settings: { disable_data_processing: false }).
                                  pluck(:id)
      end
    end
  end
end
