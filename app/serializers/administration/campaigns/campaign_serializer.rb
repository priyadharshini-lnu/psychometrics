# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignSerializer < ActiveModel::Serializer
      include Rails.application.routes.url_helpers

      attributes :id, :name, :start_date, :end_date, :type, :status, :campaign_url, :is_threesixty,
                 :is_fixed_time, :project_id, :permissions

      has_many :assessments, serializer: Administration::Campaigns::AssessmentSerializer
      has_many :reports, serializer: Administration::Campaigns::ReportSerializer

      def campaign_url
        if object.threesixty?
          return administration_client_project_threesixty_campaign_path(
            project.parent_id,
            project,
            object.threesixty_campaign.id
          )
        end

        administration_project_new_campaign_path(project, object)
      end

      def is_threesixty # rubocop:disable Naming/PredicateName
        object.threesixty?
      end

      def is_fixed_time # rubocop:disable Naming/PredicateName
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
            %w[delete destroy]
          ],
          instance_options[:project_id]
        )
      end

      private

      def project
        object.project
      end

      def current_user
        instance_options[:current_user]
      end
    end
  end
end
