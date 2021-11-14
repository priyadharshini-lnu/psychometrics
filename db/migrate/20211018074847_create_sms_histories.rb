# frozen_string_literal: true

class CreateSmsHistories < ActiveRecord::Migration[5.2]
  def change
    create_table :sms_histories do |t|
      t.references :sms_invite, foreign_key: true, null: false
      t.references :sms_record, foreign_key: true, null: false
      t.string :status

      t.timestamps
    end
  end
end
