class AddWorkshopInvitedSubjectIdToWorkshopSubject < ActiveRecord::Migration[7.0]
  def change
    add_reference :workshop_subjects, :workshop_invited_subject, foreign_key: { on_delete: :nullify }
  end
end
