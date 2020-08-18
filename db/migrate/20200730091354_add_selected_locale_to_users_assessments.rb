# frozen_string_literal: true

class AddSelectedLocaleToUsersAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :user_assessments, :selected_locale, :string
  end
end
