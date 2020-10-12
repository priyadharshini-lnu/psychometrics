# frozen_string_literal: true

class AddSelectedLocaleToUsersResult < ActiveRecord::Migration[5.1]
  def change
    remove_column :user_assessments, :selected_locale
    add_column :users_results, :selected_locale, :string
  end
end
