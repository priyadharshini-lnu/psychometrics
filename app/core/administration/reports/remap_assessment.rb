# frozen_string_literal: true

module Administration::Reports
  class RemapAssessment < BaseCommand
    private_attr_reader :report, :current_assessment_id, :new_assessment_id

    def initialize(report, current_assessment_id, new_assessment_id)
      @report = report
      @current_assessment_id = current_assessment_id
      @new_assessment_id = new_assessment_id
    end

    def call
      Report.transaction do
        update_filters
        update_modules
        update_module_conditions
        update_page_conditions
      end
      broadcast :ok
    end

    private

    def update_filters
      @report.filters.where(assessment_id: current_assessment_id).update_all(assessment_id: new_assessment_id)
    end

    def update_modules
      @report.modules.where(assessment_id: current_assessment_id).update_all(assessment_id: new_assessment_id)
    end

    def update_module_conditions
      modules = @report.modules.where("reports_modules.props ->> 'textConditions' IS NOT NULL")
      modules.each do |mod|
        mod.props['textConditions'] = mod.props['textConditions'].map do |condition|
          condition['conditions'] = condition['conditions'].map do |c|
            if c['props']['assessmentId'] == current_assessment_id.to_s
              c['props']['assessmentId'] = new_assessment_id.to_s
            end
            c
          end
          condition
        end
        mod.save
      end
    end

    def update_page_conditions
      pages = @report.pages.where.not({ display_logic: nil })
      pages.each do |page|
        page.display_logic['conditions'] = page.display_logic['conditions'].map do |condition|
          condition['conditions'] = condition['conditions'].map do |c|
            c['subject'] = new_assessment_id.to_s if c['subject'] == current_assessment_id.to_s
            c
          end
          condition
        end
        page.save
      end
    end
  end
end
