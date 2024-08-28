# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Create < BaseCommand
      private_attr_reader :project, :form, :user

      def initialize(project, form, user)
        @project = project
        @form = form
        @user = user
      end

      def call
        threesixty_campaign = ApplicationRecord.transaction do
          threesixty_campaign = if assessment
                                  ::Threesixty::Campaigns::CreateFromAssessmentAndReport.call!(
                                    assessment, report, form, project, user, resource_name: form.name
                                  )
                                else
                                  ::Threesixty::Campaigns::CreateEmptyCampaign.call!(
                                    form, project, user, resource_name: form.name
                                  )
                                end

          AuditLogModule.audit! :create_threesixty_campaign, threesixty_campaign.campaign, payload: form.attributes,
                                project: project, user: user

          load_templates(threesixty_campaign, assessment&.threesixty_campaign)

          campaign = threesixty_campaign.campaign
          if threesixty_campaign.assessment
            campaign.campaign_assessments.create(assessment_id: threesixty_campaign.assessment_id)
          end
          campaign.campaign_reports.create(report_id: threesixty_campaign.report_id) if threesixty_campaign.report
          threesixty_campaign
        end

        broadcast :ok, threesixty_campaign
      end

      private

      def assessment
        return campaign_template.assessment if form.threesixty_type == Threesixty::Campaign::STANDARD_360
        return Assessment.find(form.assessment_id) if form.threesixty_type == Threesixty::Campaign::PREVIOUS_360
      end

      def report
        return campaign_template.report if form.threesixty_type == Threesixty::Campaign::STANDARD_360
        return assessment.reports.first if form.threesixty_type == Threesixty::Campaign::PREVIOUS_360
      end

      def campaign_template
        @campaign_template ||= CampaignTemplate.find(form.campaign_template_id)
      end

      def load_templates(threesixty_campaign, prev_campaign)
        Threesixty::EmailTemplates::Load.call(threesixty_campaign, prev_campaign)
        Threesixty::InstructionTemplates::Load.call(threesixty_campaign, prev_campaign)
      end
    end
  end
end
