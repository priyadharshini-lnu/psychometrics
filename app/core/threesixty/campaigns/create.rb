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
        if clone_from_campaign_template?
          return clone_from_campaign_template
        end

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

          save_campaign_tags(threesixty_campaign.campaign)
          load_templates(threesixty_campaign, assessment&.threesixty_campaign)

          campaign = threesixty_campaign.campaign
          save_campaign_name_translations(campaign)
          if threesixty_campaign.assessment
            campaign.campaign_assessments.create(assessment_id: threesixty_campaign.assessment_id)
          end
          if threesixty_campaign.report
            campaign.campaign_reports.create(report_id: threesixty_campaign.report_id,
                                             default_language: threesixty_campaign.report.default_language)
          end
          threesixty_campaign
        end

        broadcast :ok, threesixty_campaign
      end

      private

      def assessment
        return campaign_template.assessment if form.threesixty_type == Threesixty::Campaign::STANDARD_360

        Assessment.find(form.assessment_id) if form.threesixty_type == Threesixty::Campaign::PREVIOUS_360
      end

      def report
        return campaign_template.report if form.threesixty_type == Threesixty::Campaign::STANDARD_360

        assessment.reports.first if form.threesixty_type == Threesixty::Campaign::PREVIOUS_360
      end

      def campaign_template
        @campaign_template ||= CampaignTemplate.find(form.campaign_template_id)
      end

      def load_templates(threesixty_campaign, prev_campaign)
        Threesixty::EmailTemplates::Load.call(threesixty_campaign, prev_campaign)
        Threesixty::InstructionTemplates::Load.call(threesixty_campaign, prev_campaign)
      end

      def save_campaign_tags(campaign)
        return if form.tag_list.blank?

        campaign.save_tag_with_ownership(form.tag_list)
        campaign.save!
      end

      def save_campaign_name_translations(campaign)
        app_locale = I18n.locale.to_s
        selected_locale = form.name_locale.presence || app_locale

        Mobility.with_locale(app_locale) do
          campaign.name = form.name
        end

        if form.translated_name.present?
          Mobility.with_locale(selected_locale) do
            campaign.name = form.translated_name
          end
        end

        campaign.save!
      end

      def clone_from_campaign_template?
        form.threesixty_type == Campaign::STANDARD_360 && campaign_template.campaign_id.present?
      end

      def clone_from_campaign_template
        result = ::Threesixty::Campaigns::CopyAsTemplateOrCampaign.call(
          campaign_template.campaign,
          is_template: false,
          form: form,
          project: project
        )
        if result[:ok]
          save_campaign_tags(result[:ok][:campaign])
          broadcast :ok, result[:ok][:campaign].threesixty_campaign
        else
          broadcast :error, result[:error]
        end
      end
    end
  end
end
