# frozen_string_literal: true

class AddFieldsToSmsHistory < ActiveRecord::Migration[5.2]
  def change
    add_column :sms_histories, :twilio_sid, :string
    add_column :sms_histories, :segment_length, :integer
    add_column :sms_histories, :price, :decimal
    add_column :sms_histories, :first_name, :string
    add_column :sms_histories, :last_name, :string
    add_column :sms_histories, :mobile_no, :string

    remove_column :sms_histories, :sms_invite_id
  end
end
