# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CopyAsTemplateOrCampaign < BaseCommand
      attr_reader :campaign, :client, :threesixty_campaign, :cloned_campaign, :is_template, :cloned_assessment,
                  :cloned_report, :cloned_dimension, :form, :old_to_new_factor_mapping, :questions_mapping, :project

      def initialize(campaign, is_template: true, form: nil, project: nil)
        @campaign = campaign
        @client = campaign.project.client
        @project = project || campaign.project
        @is_template = is_template
        @threesixty_campaign = campaign.threesixty_campaign
        @old_to_new_factor_mapping = {}
        @form = form
      end

      def call
        ActiveRecord::Base.transaction do
          clone_campaign
          setup_as_template_or_campaign
          clone_campaign_associations
          create_campaign_template
        end

        broadcast :ok, { campaign: cloned_campaign }
      rescue StandardError => e
        broadcast :error, e.message.to_s
      end

      private

      def clone_campaign
        @cloned_campaign = campaign.deep_clone include: %i[
          campaign_options
          sheets
          campaign_datasheet
          accesssheet
          relationships
        ], except: %i[
          encrypted_pdf_password
          encrypted_pdf_password_iv
        ]

        clone_threesixty_campaign

        cloned_campaign
      end

      def clone_threesixty_campaign
        clone_dimension if threesixty_campaign.normal?
        clone_assessment
        clone_report

        cloned_tc = threesixty_campaign.deep_clone include: %i[option
                                                               email_templates
                                                               email_schedules
                                                               instruction_templates
                                                               nomination_requirements]
        cloned_tc.campaign = cloned_campaign
        cloned_tc.assessment = cloned_assessment
        cloned_tc.report = cloned_report
        cloned_tc.save!
      end

      def clone_dimension
        dimension = threesixty_campaign.assessment.dimension
        factor_ids = dimension.all_factors.pluck(:id)

        result = Dimensions::Copy.call!(
          dimension,
          factor_ids,
          client,
          new_dimension_name: form&.name || dimension.name
        )

        @cloned_dimension = result[:new_dimension]
        @old_to_new_factor_mapping = result[:old_to_new_factor_mapping]
      end

      def clone_assessment
        assessment = threesixty_campaign.assessment

        event = ::Assessments::CopyAssessment.call(
          assessment.id,
          assessment.created_by,
          client.id,
          skip_owner_validation: true,
          new_assessment_name: form&.name || assessment.name
        )
        @cloned_assessment = event[:ok][:assessment]
        @questions_mapping = event[:ok][:questions_mapping]

        if threesixty_campaign.normal?
          cloned_assessment.dimension = cloned_dimension
          update_factors_scorings

        end
        cloned_assessment.save!
      end

      def update_factors_scorings
        old_to_new_factor_mapping.each do |old_factor_id, new_factor|
          cloned_assessment.factors_scoring.where(factor_id: old_factor_id).update_all(factor_id: new_factor.id)
        end
      end

      def clone_report
        report = threesixty_campaign.report
        @cloned_report = ::Reports::CopyReport.call!(
          report.id,
          report.created_by,
          client.id,
          new_report_name: form&.name || report.name
        )
        cloned_report.assessment_id = cloned_assessment.id
        cloned_report.skip_owner_validation = true
        cloned_report.save!

        cloned_report.filters.update_all(assessment_id: cloned_assessment.id)
        cloned_report.assessments_reports.update_all(assessment_id: cloned_assessment.id)
        cloned_report.modules.update_all(assessment_id: cloned_assessment.id)

        cloned_report.reload.add_all_factor_aliases

        if threesixty_campaign.normal?
          Threesixty::ReportsModules::RemapFactor.call!(cloned_report, old_to_new_factor_mapping)
        end
        Threesixty::ReportsModules::RemapQuestion.call!(cloned_report, questions_mapping)
      end

      def setup_as_template_or_campaign
        cloned_campaign.project_id = project.id
        cloned_campaign.is_template = is_template
        cloned_campaign.status = form.status if form&.status.present?
        cloned_campaign.name = form&.name || "Template from #{campaign.name}"
        cloned_campaign.save!
      end

      def clone_campaign_associations
        clone_campaign_assessments
        clone_campaign_reports
        clone_factor_benchmark_scores
        clone_report_approval_settings
      end

      def clone_campaign_assessments
        campaign.campaign_assessments.each do |ca|
          new_ca = ca.dup
          new_ca.campaign_id = cloned_campaign.id
          if campaign.threesixty?
            new_ca.assessment_id = cloned_campaign.threesixty_campaign.assessment.id
          end
          new_ca.save!
        end
      end

      def clone_campaign_reports
        campaign.campaign_reports.each do |cr|
          new_cr = cr.dup
          new_cr.campaign_id = cloned_campaign.id
          if campaign.threesixty?
            new_cr.report_id = cloned_campaign.threesixty_campaign.report.id
          end
          new_cr.save!
        end
      end

      def clone_factor_benchmark_scores
        campaign.factor_benchmark_scores.find_each do |factor_benchmark_score|
          cloned_score = factor_benchmark_score.dup
          cloned_score.campaign_id = cloned_campaign.id
          cloned_score.assessment_id = cloned_assessment.id

          if threesixty_campaign.normal?
            new_factor = old_to_new_factor_mapping[factor_benchmark_score.factor_id]
            cloned_score.factor_id = new_factor.id if new_factor.present?
          end

          cloned_score.save!
        end
      end

      def clone_report_approval_settings
        campaign.report_approval_settings.find_each do |setting|
          cloned_setting = setting.dup
          cloned_setting.campaign_id = cloned_campaign.id
          cloned_setting.report_id = cloned_report.id
          cloned_setting.save!
        end
      end

      def create_campaign_template
        return unless is_template

        CampaignTemplate.create!(
          name: cloned_campaign.name,
          campaign: cloned_campaign,
          assessment: cloned_assessment,
          report: cloned_report,
          owner: client
        )
      end
    end
  end
end
