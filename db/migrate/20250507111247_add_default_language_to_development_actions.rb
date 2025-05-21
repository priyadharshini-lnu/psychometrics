# frozen_string_literal: true

class AddDefaultLanguageToDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    add_column :development_actions, :default_language, :string, default: 'en', null: false
  end
end
