class CreateCommunicationEmails < ActiveRecord::Migration[5.0]
  def change
    create_table :communication_emails do |t|
      t.references :membership, index: true
      t.references :communication, index: true
      t.timestamps
    end
  end
end
