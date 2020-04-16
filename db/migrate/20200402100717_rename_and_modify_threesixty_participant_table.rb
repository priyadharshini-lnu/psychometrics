# frozen_string_literal: true

class RenameAndModifyThreesixtyParticipantTable < ActiveRecord::Migration[5.1]
  def change
    rename_table :threesixty_participants, :users_campaigns_assessments
    add_reference :users_campaigns_assessments, :assessment, foreign_key: { on_delete: :nullify }
    add_reference :users_campaigns_assessments, :users_result, foreign_key: { on_delete: :nullify }
  end
end
