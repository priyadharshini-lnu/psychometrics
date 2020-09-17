# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignSerializer < ActiveModel::Serializer
      include Rails.application.routes.url_helpers

      attributes :id, :name, :type, :status, :options, :campaign_url, :is_threesixty

      has_one :campaign_options, serializer: Administration::Campaigns::CampaignOptionsSerializer
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

      private

      def project
        object.project
      end
    end
  end
end
