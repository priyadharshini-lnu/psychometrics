# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignSerializer < Panko::Serializer
      include Rails.application.routes.url_helpers

      attributes :id, :name, :start_date, :end_date, :type, :status, :campaign_url, :is_threesixty,
                 :is_fixed_time, :project_id, :permissions, :practice_campaign

      has_many :assessments, each_serializer: Administration::Campaigns::AssessmentSerializer
      has_many :reports, each_serializer: Administration::Campaigns::ReportSerializer

      def campaign_url
        "#{admin_path}/projects/#{project.id}/new_campaigns/#{object.id}"
      end

      def is_threesixty
        object.threesixty?
      end

      def is_fixed_time
        object.campaign_options&.fixed_time
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::CampaignPolicy,
          current_user,
          object,
          [
            'edit',
            'copy',
            %w[delete destroy],
            'manage_campaign_admins',
            %w[manage_options update_campaign_options],
            'manage_campaigns',
            'view_registration_codes',
            'view_datasheets',
            'view_sms_invites',
            'view_dashboard',
            'view_accesssheet',
            'view_accesssheet_settings',
            'view_assessors',
            'view_workshops',
            'view_workshop_invites',
            'stats',
            'pdf_password',
            'view_campaign_scoring',
            'view_campaign_scoring_setting',
            'manage_campaign_scoring',
            'view_audit_reports',
            'view_assessments_and_reports',
            'manage_report_approval_settings'
          ],
          {
            project_id: project.id,
            campaign_id: object.id
          }
        )
      end

      private

      def project
        object.project
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
