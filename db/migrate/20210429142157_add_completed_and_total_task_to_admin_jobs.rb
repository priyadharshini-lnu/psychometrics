# frozen_string_literal: true

class AddCompletedAndTotalTaskToAdminJobs < ActiveRecord::Migration[5.2]
  def change
    add_column :admin_jobs, :total_tasks, :integer, default: 1
    add_column :admin_jobs, :completed_tasks, :integer, default: 0
    remove_column :admin_jobs, :progress
  end
end
