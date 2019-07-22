class RenameParticipantTable < ActiveRecord::Migration[5.1]
  def change
    rename_table :participants, :threesixty_participants
  end
end
