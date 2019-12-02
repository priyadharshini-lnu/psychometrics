# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateFromAssessmentAndReport < BaseCommand
      private_attr_reader :source_assessment, :source_report, :new_assessment, :new_report,
                          :form, :project, :threesixty_campaign

      def initialize(source_assessment, source_report, form, project)
        @source_assessment = source_assessment
        @source_report = source_report
        @new_report = ::Reports::CopyReport.call(source_report.id)[:ok]
        @new_assessment = CopyAssessment.process!(source_assessment.id)
        @form = form
        @project = project
        @threesixty_campaign = Threesixty::Campaigns::Build.call!(form, project)
      end

      def call
        new_deminsion = copy_dimension
        copy_factors_and_map_scoring(source_assessment.dimension, new_deminsion)

        new_assessment.update!(dimension_id: new_deminsion.id)
        update_new_report

        threesixty_campaign.assessment_id = new_assessment.id
        threesixty_campaign.report_id = new_report.id
        threesixty_campaign.save!

        broadcast :ok, threesixty_campaign
      end

      def copy_dimension
        dimension = source_assessment.dimension.deep_clone(include: [:occupations])
        dimension.owner_id = project.id
        dimension.gen_uniq_name
        dimension.save!
        dimension
      end

      def copy_factors_and_map_scoring(source_dimension, new_deminsion)
        @old_to_new_factor_mapping = {}
        campaign_factors = form.factors || []
        source_dimension.factors.where(id: campaign_factors).each do |factor|
          new_factor = factor.clone_and_save
          factor.factors_sub_factors.pluck(:subfactor_id)
          new_factor.dimension_id = new_deminsion.id
          new_factor.save!
          @old_to_new_factor_mapping[factor.id] = new_factor
          new_assessment.factors_scoring.where(factor_id: factor.id).update_all(factor_id: new_factor.id)
        end

        # factors_to_delete = source_dimension.factor_ids - campaign_factors.map(&:to_i)
        # new_assessment.factors_scoring.where(factor_id: factors_to_delete).destroy_all
      end

      def update_new_report
        new_report.owner_id = project.id
        new_report.category = :threesixty
        new_report.assessment_id = new_assessment.id
        new_report.save!

        Threesixty::ReportsModules::RemapFactor.call!(new_report, @old_to_new_factor_mapping)

        new_report.assessments_reports.update_all(assessment_id: new_assessment.id)
        new_report.modules.update_all(assessment_id: new_assessment.id)
      end
    end
  end
end
