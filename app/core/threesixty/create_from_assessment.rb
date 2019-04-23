module Threesixty
  class CreateFromAssessment < Rectify::Command
    attr_reader :campaign

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      source_assessment = Assessment.find(@campaign.assessment_id)

      copy_report(source_assessment)
      @assessment = CopyAssessment.process!(source_assessment.id)

      copy_dimension
      copy_factors_and_map_scoring(source_assessment.dimension)

      @assessment.dimension_id = @dimension.id
      @report.assessments_reports.destroy_all
      @report.assessments << @assessment
      @report.assessment_id = @assessment
      @campaign.assessment_id = @assessment.id
      @campaign.report_id = @report.id

      broadcast :ok, @campaign
    end


    def copy_dimension
      @dimension = @assessment.dimension.deep_clone(include: [:occupations])
      @dimension.owner_id = @campaign.campaign.project_id
      @dimension.gen_uniq_name
      @dimension.save
    end

    def copy_factors_and_map_scoring(source_dimension)
      source_dimension.factors.where(id: @campaign.factors).each do |factor|
        new_factor = factor.clone_and_save
        new_factor.dimension_id = @dimension.id
        new_factor.save
        @assessment.factors_scoring.where(factor_id: factor.id).update_all(factor_id: new_factor.id)
      end

      factors_to_delete = source_dimension.factor_ids - @campaign.factors.map(&:to_i)
      @assessment.factors_scoring.where(factor_id: factors_to_delete).destroy_all
    end

    def copy_report(assessment)
      @report = assessment.reports.first.clone
      @report.owner_id = @campaign.campaign.project_id
      @report.save
    end
  end
end
