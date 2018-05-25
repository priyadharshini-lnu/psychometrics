class AddAssessmentToReportsModule < ActiveRecord::Migration[5.1]
  disable_ddl_transaction!

  def change
    add_reference :reports_modules, :assessment, foreign_key: { on_delete: :cascade }

    reversible do |dir|
      dir.up do
        Reports::Module.find_each do |reports_module|
          reports_module.update_columns(assessment_id: reports_module.page.report.assessment_id)
        end
      end
    end
  end
end
