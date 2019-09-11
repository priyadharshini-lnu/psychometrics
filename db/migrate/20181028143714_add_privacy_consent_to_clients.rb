# frozen_string_literal: true

class AddPrivacyConsentToClients < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :privacy_consent, :boolean
  end
end
