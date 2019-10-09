# frozen_string_literal: true

class AddCitextToUsers < ActiveRecord::Migration[5.1]
  def change
    change_column :users, :email, :citext, null: false
    execute 'CREATE UNIQUE INDEX users_email_project_id_index ON users
      (email, COALESCE(project_id, 0))'
  end
end
