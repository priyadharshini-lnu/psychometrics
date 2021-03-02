# frozen_string_literal: true

class ForceMentisToExistingUsers < ActiveRecord::Migration[5.2]
  def change
    HoganCredential.update_all(provider: :mentis)
  end
end
