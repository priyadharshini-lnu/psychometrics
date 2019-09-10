# frozen_string_literal: true

class CreateAssessmentsReports < ActiveRecord::Migration[5.1]
  def change
    create_table :assessments_reports do |t|
      t.references :assessment, foreign_key: { on_delete: :cascade }, null: false
      t.references :report, foreign_key: { on_delete: :cascade }, null: false

      t.timestamps
    end
    # Moving this to a separate migration 20181002152730_add_assessments_for_reports due to an error
    # while running migrations
    # reversible do |dir|
    #   dir.up do
    #     Report.find_each do |report|
    #       report.assessments << report.assessment
    #     end
    #   end
    # end
  end
end
