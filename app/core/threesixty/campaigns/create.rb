# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Create < BaseCommand
      def initialize(project, campaign_params, threesixty_campaign_params)
        @project = project
        @campaign_params = campaign_params
        @threesixty_campaign_params = threesixty_campaign_params
      end

      def call
        campaign = project.project_campaigns.build(campaign_params)
        campaign.type = ::Campaign::THREESIXTY
        threesixty_campaign = campaign.build_threesixty_campaign(threesixty_campaign_params)
        threesixty_campaign.build_option(participants: Threesixty::Option::DEFAULT_PARTICIPANTS,
                                         reports: Threesixty::Option::DEFAULT_REPORTS)
        if threesixty_campaign.assessment.present?
          ::Threesixty::CreateFromAssessment.call(threesixty_campaign)
        else
          ::Threesixty::CreateEmptyCampaign.call(threesixty_campaign)
        end
        campaign.save!
        load_templates(threesixty_campaign)
        broadcast :ok, campaign
      end

      private

      attr_reader :project, :campaign_params, :threesixty_campaign_params

      def load_templates(threesixty_campaign)
        Threesixty::EmailTemplates::Load.call(threesixty_campaign)
        Threesixty::InstructionTemplates::Load.call(threesixty_campaign)
      end
    end
  end
end
