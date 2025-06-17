# frozen_string_literal: true

class AddStepsFieldsToAdminJobRecords < ActiveRecord::Migration[7.1]
  def change
    change_table :admin_jobs, bulk: true do |t|
      t.string :step
      t.float :weight
      t.references :parent_job, null: true, foreign_key: { to_table: :admin_jobs, on_delete: :nullify }
    end
  end
end
