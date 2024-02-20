class AddDefaultLanguageToAssessments < ActiveRecord::Migration[7.1]
  def change
    add_column :assessments, :default_language, :string, default: 'en'
  end
end
