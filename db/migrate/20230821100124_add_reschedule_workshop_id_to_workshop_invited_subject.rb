class AddRescheduleWorkshopIdToWorkshopInvitedSubject < ActiveRecord::Migration[7.0]
  def change
    add_reference :workshop_invited_subjects, :reschedule_workshop, foreign_key: { to_table: :workshops }
  end
end
