# frozen_string_literal: true

class AddMetaToReportsModules < ActiveRecord::Migration[6.1]
  def change
    add_column :reports_modules, :meta, :json, default: { hidden: false, locked: false }
  end
end
