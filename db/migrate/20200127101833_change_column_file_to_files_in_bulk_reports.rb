# frozen_string_literal: true

class ChangeColumnFileToFilesInBulkReports < ActiveRecord::Migration[5.1]
  def change
    add_column :bulk_reports, :files, :string, after: :file

    BulkReport.update_all('files = file')
    change_column :bulk_reports, :files, :string, array: true, default: [], using: "(string_to_array(files, ','))"

    remove_column :bulk_reports, :file
  end
end
