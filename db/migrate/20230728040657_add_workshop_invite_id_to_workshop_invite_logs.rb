class AddWorkshopInviteIdToWorkshopInviteLogs < ActiveRecord::Migration[7.0]
  def change
    add_reference :workshop_invite_logs, :workshop_invite, foreign_key: true
  end
end
