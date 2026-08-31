# frozen_string_literal: true

class RenameCommunicationCenterOnlyToUseNewCommunicationCenter < ActiveRecord::Migration[8.0]
  def change
    rename_column :client_features, :communication_center_only, :use_new_communication_center
  end
end
