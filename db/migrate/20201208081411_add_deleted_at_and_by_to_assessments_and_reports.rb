# frozen_string_literal: true

class AddDeletedAtAndByToAssessmentsAndReports < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments, :deleted_at, :datetime
    add_reference :assessments, :deleted_by, foreign_key: { on_delete: :nullify, to_table: :users }

    add_column :reports, :deleted_at, :datetime
    add_reference :reports, :deleted_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
