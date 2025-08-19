# frozen_string_literal: true

class AddedEnableRecaptchaToSecuritySettings < ActiveRecord::Migration[7.1]
  def change
    add_column :security_settings, :enable_recaptcha, :boolean, default: false
  end
end
