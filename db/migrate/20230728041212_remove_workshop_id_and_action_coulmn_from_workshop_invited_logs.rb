class RemoveWorkshopIdAndActionCoulmnFromWorkshopInvitedLogs < ActiveRecord::Migration[7.0]
  def change
    remove_column :workshop_invite_logs, :workshop_id
    remove_column :workshop_invite_logs, :action
  end
end
