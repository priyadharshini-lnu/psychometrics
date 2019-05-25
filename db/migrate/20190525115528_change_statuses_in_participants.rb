class ChangeStatusesInParticipants < ActiveRecord::Migration[5.1]
  def change
    rename_column :participants, :manager_status, :manager_nomination_status
    rename_column :participants, :evaluator_status, :evaluator_nomination_status
    change_column :participants, :manager_nomination_status, :integer, default: 0
    change_column :participants, :evaluator_nomination_status, :integer, default: 0
    add_column :participants, :manager_evaluation_status, :integer, default: 0
  end
end
