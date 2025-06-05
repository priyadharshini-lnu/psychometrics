# frozen_string_literal: true

class AddFieldsToPrivacyConsents < ActiveRecord::Migration[7.1]
  def change
    change_table :privacy_consents, bulk: true do |t|
      t.string :ip_address
      t.string :user_agent
      t.string :locale
    end
  end
end
