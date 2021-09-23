# frozen_string_literal: true

class CreateSmsInvites < ActiveRecord::Migration[5.2]
  def change
    create_table :sms_invites do |t|
      t.string :first_name
      t.string :last_name
      t.string :mobile_no
      t.string :locale, default: 'en'
      t.string :code
      t.integer :status, default: 0
      t.belongs_to :registered_user, foreign_key: { to_table: :users, on_delete: :cascade }
      t.belongs_to :creator, foreign_key: { name: :creator_id, to_table: :users, on_delete: :cascade }, null: false
      t.belongs_to :campaign, foreign_key: { on_delete: :cascade }, null: false

      t.timestamps
    end

    add_index :sms_invites, %i[campaign_id mobile_no], unique: true
  end
end
