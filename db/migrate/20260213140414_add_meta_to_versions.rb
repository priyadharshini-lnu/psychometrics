# frozen_string_literal: true

class AddMetaToVersions < ActiveRecord::Migration[8.0]
  def change
    add_column :versions, :meta, :json
  end
end
