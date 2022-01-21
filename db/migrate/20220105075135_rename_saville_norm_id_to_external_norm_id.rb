# frozen_string_literal: true

class RenameSavilleNormIdToExternalNormId < ActiveRecord::Migration[5.2]
  def change
    rename_column :campaign_assessments, :saville_norm_id, :external_norm_id
  end
end
