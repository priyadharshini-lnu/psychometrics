# frozen_string_literal: true

class AddArchiveStatusToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :archived, :boolean, default: false
  end
end
