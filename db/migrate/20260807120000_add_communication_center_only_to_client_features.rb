# frozen_string_literal: true

class AddCommunicationCenterOnlyToClientFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :client_features, :communication_center_only, :boolean, default: false, null: false
  end
end
