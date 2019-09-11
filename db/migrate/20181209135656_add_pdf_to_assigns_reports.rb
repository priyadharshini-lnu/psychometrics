# frozen_string_literal: true

class AddPdfToAssignsReports < ActiveRecord::Migration[5.1]
  def change
    change_table :assigns_reports do |t|
      t.string :pdf
      t.boolean :generating, default: false
    end
  end
end
