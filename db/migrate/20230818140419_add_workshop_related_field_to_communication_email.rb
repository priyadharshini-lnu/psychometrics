class AddWorkshopRelatedFieldToCommunicationEmail < ActiveRecord::Migration[7.0]
  def change
    add_reference :communication_emails, :workshop, foreign_key: true
    add_reference :communication_emails, :workshop_invite, foreign_key: true
  end
end
