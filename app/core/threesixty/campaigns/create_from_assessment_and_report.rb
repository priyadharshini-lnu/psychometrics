# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateFromAssessmentAndReport < BaseCommand
      private_attr_reader :source_assessment, :source_report, :new_assessment, :new_report,
                          :form, :project, :threesixty_campaign, :old_to_new_factor_mapping

      def initialize(source_assessment, source_report, form, project)
        @source_assessment = source_assessment
        @source_report = source_report
        @new_report = ::Reports::CopyReport.call!(source_report.id)

        event = ::Assessments::CopyAssessment.call(source_assessment.id)
        @new_assessment = event[:ok] || raise('CopyAssessment failed!')

        @form = form
        @project = project
        @threesixty_campaign = Threesixty::Campaigns::Build.call!(form, project)
        @old_to_new_factor_mapping = {}
      end

      def call
        result = Dimensions::Copy.call!(source_assessment.dimension, form.factors || [], project)
        new_dimension = result[:new_dimension]
        update_factor_ids(result[:old_to_new_factor_mapping])

        new_assessment.update!(dimension_id: new_dimension.id)
        update_new_report(result[:old_to_new_factor_mapping])
        update_threesixty_campaign

        broadcast :ok, threesixty_campaign
      end

      def update_factor_ids(old_to_new_factor_mapping)
        old_to_new_factor_mapping.each do |old_factor_id, new_factor|
          new_assessment.factors_scoring.where(factor_id: old_factor_id).update_all(factor_id: new_factor.id)
        end
      end

      def update_new_report(old_to_new_factor_mapping)
        new_report.owner_id = project.id
        new_report.category = :threesixty
        new_report.assessment_id = new_assessment.id
        new_report.save!

        Threesixty::ReportsModules::RemapFactor.call!(new_report, old_to_new_factor_mapping)

        new_report.filters.update_all(assessment_id: new_assessment.id)
        new_report.assessments_reports.update_all(assessment_id: new_assessment.id)
        new_report.modules.update_all(assessment_id: new_assessment.id)
      end

      def update_threesixty_campaign
        threesixty_campaign.assessment_id = new_assessment.id
        threesixty_campaign.report_id = new_report.id
        threesixty_campaign.save!
      end
    end
  end
end
