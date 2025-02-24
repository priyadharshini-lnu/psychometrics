# frozen_string_literal: true

class AddHideSignupToRegistrationSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :registration_settings, :hide_signup, :boolean, default: false
  end
end
