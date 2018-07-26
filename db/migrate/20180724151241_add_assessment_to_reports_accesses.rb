class AddAssessmentToReportsAccesses < ActiveRecord::Migration[5.1]
  def change
    remove_index :reports_accesses, column: [:report_id, :membership_id], unique: true
    add_reference :reports_accesses, :assessment, foreign_key: { on_delete: :cascade }
    add_index :reports_accesses, [:report_id, :membership_id, :assessment_id], unique: true,
              name: :index_reports_accesses_on_report_id_membership_id_assessment_id

    reversible do |dir|
      dir.up do
        ReportsAccess.find_each do |report_access|
          report_access.update(assessment: report_access.report.assessments.first)
        end
      end
    end
  end
end
