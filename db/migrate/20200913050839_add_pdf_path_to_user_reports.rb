# frozen_string_literal: true

class AddPdfPathToUserReports < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reports, :pdf_path, :string
  end
end
