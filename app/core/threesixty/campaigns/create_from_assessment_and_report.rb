# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateFromAssessmentAndReport < BaseCommand
      private_attr_reader :source_assessment, :source_report, :new_assessment, :new_report, :client,
                          :form, :project, :threesixty_campaign, :old_to_new_factor_mapping, :questions_mapping,
                          :resource_name, :user

      # rubocop:disable Metrics/ParameterLists
      def initialize(source_assessment, source_report, form, project, user, resource_name: nil)
        @source_assessment = source_assessment
        @source_report = source_report
        @resource_name = resource_name
        @project = project
        @client = project.client
        @user = user

        @form = form
        @threesixty_campaign = Threesixty::Campaigns::Build.call!(form, project)
        @old_to_new_factor_mapping = {}
      end
      # rubocop:enable Metrics/ParameterLists

      def call # rubocop:disable Metrics/AbcSize
        factor_ids = form.factors.presence || source_assessment.dimension.all_factors.pluck(:id)

        new_dimension = if form.skill_rater?
                          skill_rater_dimension
                        else
                          result = Dimensions::Copy.call!(
                            source_assessment.dimension, factor_ids, client, new_dimension_name: form.name
                          )
                          result[:new_dimension]
                        end

        event = ::Assessments::CopyAssessment.call(
          source_assessment.id, user, client.id, skip_owner_validation: true,
          new_assessment_name: resource_name,
          questions_to_copy: form.questions.presence
        )
        raise('CopyAssessment failed!') unless event[:ok]

        @new_assessment = event[:ok][:assessment]
        @questions_mapping = event[:ok][:questions_mapping]

        update_factor_ids(result[:old_to_new_factor_mapping]) if result

        @new_report = ::Reports::CopyReport.call!(source_report.id, user, client.id, new_report_name: resource_name,
                                                   skip_owner_validation: true)

        new_assessment.update!(dimension_id: new_dimension.id)
        update_new_report(result[:old_to_new_factor_mapping]) if result
        update_threesixty_campaign

        broadcast :ok, threesixty_campaign
      end

      def update_factor_ids(old_to_new_factor_mapping)
        old_to_new_factor_mapping.each do |old_factor_id, new_factor|
          new_assessment.factors_scoring.where(factor_id: old_factor_id).update_all(factor_id: new_factor.id)
        end
      end

      def update_new_report(old_to_new_factor_mapping)
        new_report.owner_id = client.id
        new_report.category = :threesixty
        new_report.assessment_id = new_assessment.id
        new_report.skip_owner_validation = true
        new_report.save!

        new_report.filters.update_all(assessment_id: new_assessment.id)
        new_report.assessments_reports.update_all(assessment_id: new_assessment.id)
        new_report.modules.update_all(assessment_id: new_assessment.id)

        new_report.reload.add_all_factor_aliases

        Threesixty::ReportsModules::RemapFactor.call!(new_report, old_to_new_factor_mapping)
        Threesixty::ReportsModules::RemapQuestion.call!(new_report, questions_mapping)
      end

      def update_threesixty_campaign
        threesixty_campaign.assessment_id = new_assessment.id
        threesixty_campaign.report_id = new_report.id
        threesixty_campaign.save!
      end

      private

      def skill_rater_dimension
        Dimension.skill_rater_dimension(project)
      end
    end
  end
end
