# frozen_string_literal: true

class AddRegistrationCodeRefToLicenseUsages < ActiveRecord::Migration[5.1]
  def change
    add_reference :license_usages, :registration_code, foreign_key: true, null: true
  end
end
