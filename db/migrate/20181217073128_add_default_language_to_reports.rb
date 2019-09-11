# frozen_string_literal: true

class AddDefaultLanguageToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :default_language, :string, default: 'en'
  end
end
