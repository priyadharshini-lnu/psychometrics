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
        new_dimension = copy_dimension
        copy_factors_and_map_scoring(source_assessment.dimension, new_dimension)

        new_assessment.update!(dimension_id: new_dimension.id)
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

      def copy_factors_and_map_scoring(source_dimension, new_dimension)
        @old_to_new_factor_mapping = {}
        campaign_factors = form.factors || []
        source_dimension.all_factors.where(id: campaign_factors).each do |sub_factor|
          @old_to_new_factor_mapping[sub_factor.id] ||= sub_factor.clone_and_save
          new_sub_factor = @old_to_new_factor_mapping[sub_factor.id]
          update_factor_ids(sub_factor.id, new_sub_factor.id)
          sub_factor.ancestors.each do |factor|
            unless @old_to_new_factor_mapping[factor.id]
              new_factor = factor.clone
              new_factor.save!
              @old_to_new_factor_mapping[factor.id] = new_factor
              update_factor_ids(factor.id, new_factor.id)
            end
            create_factor_sub_factor(factor, sub_factor, @old_to_new_factor_mapping[factor.id],
                                     @old_to_new_factor_mapping[sub_factor.id])
            update_factor_ids(factor.id, new_factor.id)
          end
        end

        new_factor_ids = @old_to_new_factor_mapping.values.map(&:id)
        Factor.where(id: new_factor_ids).update_all(dimension_id: new_dimension.id)
      end

      def update_factor_ids(old_factor_id, new_factor_id)
        new_assessment.factors_scoring.where(factor_id: old_factor_id).update_all(factor_id: new_factor_id)
      end

      def create_factor_sub_factor(old_factor, old_sub_factor, new_factor, new_sub_factor)
        factor_sub_factor = FactorsSubFactor.find_by(factor_id: old_factor.id, sub_factor_id: old_sub_factor.id)
        return if factor_sub_factor.nil?

        attributes = factor_sub_factor.attributes.except('id', 'created_at', 'updated_at').merge(
          factor_id: new_factor.id, sub_factor_id: new_sub_factor.id
        )
        FactorsSubFactor.create(attributes)
      end

      def update_new_report
        new_report.owner_id = project.id
        new_report.category = :threesixty
        new_report.assessment_id = new_assessment.id
        new_report.save!

        Threesixty::ReportsModules::RemapFactor.call!(new_report, @old_to_new_factor_mapping)

        new_report.filters.update_all(assessment_id: new_assessment.id)
        new_report.assessments_reports.update_all(assessment_id: new_assessment.id)
        new_report.modules.update_all(assessment_id: new_assessment.id)
      end
    end
  end
end
