# frozen_string_literal: true

class AddAssessmentsForReports < ActiveRecord::Migration[5.1]
  def change
    reversible do |dir|
      dir.up do
        Report.find_each do |report|
          report.assessments << report.assessment
        end
      end
    end
  end
end
