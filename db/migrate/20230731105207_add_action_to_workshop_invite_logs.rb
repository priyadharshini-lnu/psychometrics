class AddActionToWorkshopInviteLogs < ActiveRecord::Migration[7.0]
  def change
    add_column :workshop_invite_logs, :action, :integer
  end
end
