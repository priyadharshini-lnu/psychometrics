# frozen_string_literal: true

class CreateProfileSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :profile_settings do |t|
      t.integer :update_in

      t.timestamps
    end
    add_reference :profile_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }, null: false
    Client.projects.find_each(&:create_profile_setting)
  end
end
