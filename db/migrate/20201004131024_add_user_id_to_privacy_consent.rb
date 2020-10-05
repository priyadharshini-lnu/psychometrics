# frozen_string_literal: true

class AddUserIdToPrivacyConsent < ActiveRecord::Migration[5.1]
  def change
    add_reference :privacy_consents, :user, foreign_key: { on_delete: :cascade }
  end
end
