# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Create < BaseCommand
      private_attr_reader :project, :form

      def initialize(project, form)
        @project = project
        @form = form
      end

      def call
        threesixty_campaign = if assessment
                                ::Threesixty::Campaigns::CreateFromAssessmentAndReport.call!(
                                  assessment, report, form, project
                                )
                              else
                                ::Threesixty::Campaigns::CreateEmptyCampaign.call!(form, project)
                              end

        load_templates(threesixty_campaign)

        broadcast :ok, threesixty_campaign
      end

      private

      def assessment
        return campaign_template.assessment if form.type == Threesixty::Campaign::STANDARD_360
        return Assessment.find(form.assessment_id) if form.type == Threesixty::Campaign::PREVIOUS_360
      end

      def report
        return campaign_template.report if form.type == Threesixty::Campaign::STANDARD_360
        return assessment.reports.first if form.type == Threesixty::Campaign::PREVIOUS_360
      end

      def campaign_template
        @campaign_template ||= CampaignTemplate.find(form.campaign_template_id)
      end

      def load_templates(threesixty_campaign)
        Threesixty::EmailTemplates::Load.call(threesixty_campaign)
        Threesixty::InstructionTemplates::Load.call(threesixty_campaign)
      end
    end
  end
end
