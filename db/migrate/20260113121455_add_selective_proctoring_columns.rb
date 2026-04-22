# frozen_string_literal: true

class AddSelectiveProctoringColumns < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(
      :campaign_options, :selective_proctoring_enabled
    )
      add_column :campaign_options, :selective_proctoring_enabled, :boolean, default: false,
null: false
    end
    add_column :campaign_assessments, :proctoring_enabled, :boolean, default: false, null: false unless column_exists?(
      :campaign_assessments, :proctoring_enabled
    )
    remove_column :campaign_assessments, :proctoring_duration, :integer, null: true if column_exists?(
      :campaign_assessments, :proctoring_duration
    )
  end
end
