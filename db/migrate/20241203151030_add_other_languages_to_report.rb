# frozen_string_literal: true

class AddOtherLanguagesToReport < ActiveRecord::Migration[7.1]
  def change
    add_column :reports, :other_languages, :jsonb, default: []
  end
end
