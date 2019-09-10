# frozen_string_literal: true

class CreateReportsAccesses < ActiveRecord::Migration[5.1]
  def change
    create_table :reports_accesses do |t|
      t.references :report, foreign_key: { on_delete: :cascade }
      t.references :membership, foreign_key: { on_delete: :cascade }
      t.boolean :user_access, null: false

      t.index %i[report_id membership_id], unique: true

      t.timestamps
    end

    reversible do |dir|
      dir.up do
        AssignsReport.includes(assign: [:project_assign]).find_each do |assigns_report|
          reports_access = ReportsAccess.find_or_initialize_by(
            report_id: assigns_report.report_id, membership_id: assigns_report.assign.assign_with_result.membership_id
          )

          reports_access.user_access ||= assigns_report.user_access
          reports_access.save!
        end
      end
    end
  end
end
