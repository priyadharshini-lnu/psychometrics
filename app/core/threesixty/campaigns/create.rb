# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Create < BaseCommand
      private_attr_reader :project, :campaign_params, :options, :campaign_template
      private_att_accessor :threesixty_campaign_params

      def initialize(project, campaign_params, threesixty_campaign_params, options)
        @project = project
        @campaign_params = campaign_params
        @threesixty_campaign_params = threesixty_campaign_params
        @options = options
        @campaign_template = CampaignTemplate.find(options[:campaign_template_id]) if options[:campaign_template_id]
      end

      def call
        threesixty_campaign = build_threesixty_campaign

        if threesixty_campaign.assessment.present?
          ::Threesixty::CreateFromAssessment.call(threesixty_campaign, report_id: campaign_template.report_id)
        else
          ::Threesixty::CreateEmptyCampaign.call(threesixty_campaign)
        end
        campaign.save!
        load_templates(threesixty_campaign)
        broadcast :ok, campaign
      end

      private

      def build_threesixty_campaign
        campaign = project.project_campaigns.build(campaign_params)
        campaign.type = ::Campaign::THREESIXTY
        if campaign_template
          threesixty_campaign_params = threesixty_campaign_params.merge(assessment_id: campaign_template.assessment_id)
        end
        threesixty_campaign = campaign.build_threesixty_campaign(threesixty_campaign_params)
        threesixty_campaign.build_option(participants: Threesixty::Option::DEFAULT_PARTICIPANTS,
                                         reports: Threesixty::Option::DEFAULT_REPORTS)
        threesixty_campaign
      end

      def load_templates(threesixty_campaign)
        Threesixty::EmailTemplates::Load.call(threesixty_campaign)
        Threesixty::InstructionTemplates::Load.call(threesixty_campaign)
      end
    end
  end
end
