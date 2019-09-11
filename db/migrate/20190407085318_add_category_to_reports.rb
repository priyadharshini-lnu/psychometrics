# frozen_string_literal: true

class AddCategoryToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :category, :integer, default: 0
  end
end
