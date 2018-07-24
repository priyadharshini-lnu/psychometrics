class RemoveQueueSizeFromBulkReports < ActiveRecord::Migration[5.1]
  def change
    remove_column :bulk_reports, :queue_size, :integer
  end
end
