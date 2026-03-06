# frozen_string_literal: true

class AddAllowOneLevelApproveToAIScoringApprovalSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_scoring_approval_settings, :allow_one_level_approve, :boolean, default: false
  end
end
