# frozen_string_literal: true

class SetAssessmentForReportAccess < ActiveRecord::Migration[5.1]
  def change
    reversible do |dir|
      dir.up do
        ReportsAccess.find_each do |report_access|
          report_access.update(assessment: report_access.report.assessments.first)
        end
      end
    end
  end
end
