class CreateAssessmentsReports < ActiveRecord::Migration[5.1]
  def change
    create_table :assessments_reports do |t|
      t.references :assessment, foreign_key: { on_delete: :cascade }, null: false
      t.references :report, foreign_key: { on_delete: :cascade }, null: false

      t.timestamps
    end

    reversible do |dir|
      dir.up do
        Report.find_each do |report|
          report.assessments << report.assessment
        end
      end
    end
  end
end
