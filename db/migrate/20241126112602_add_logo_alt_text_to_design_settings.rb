# frozen_string_literal: true

class AddLogoAltTextToDesignSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :design_settings, :logo_alt_text, :string
    add_column :design_settings, :secondary_logo_alt_text, :string
  end
end
