# frozen_string_literal: true

class AddDurationAndAvailableLanguagesToDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    change_table :development_actions, bulk: true do |t|
      t.integer :duration
      t.jsonb :available_languages, default: []
    end
  end
end
