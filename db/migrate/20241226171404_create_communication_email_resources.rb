# frozen_string_literal: true

class CreateCommunicationEmailResources < ActiveRecord::Migration[7.1]
  def change
    create_table :communication_email_resources do |t|
      t.references :communication_email, null: false, foreign_key: true
      t.references :resource, polymorphic: true, null: false

      t.timestamps
    end
  end
end
