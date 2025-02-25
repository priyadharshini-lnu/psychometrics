# frozen_string_literal: true

class AddColumnsToSamlSetting < ActiveRecord::Migration[7.1]
  def change
    change_table :saml_settings do |t|
      t.integer :name_identifier_format, default: 0
      t.string :email_pipetext
    end
  end
end
