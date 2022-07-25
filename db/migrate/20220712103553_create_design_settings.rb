# frozen_string_literal: true

class CreateDesignSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :design_settings do |t|
      t.string :logo
      t.string :background
      t.string :login_box_position
      t.string :background_color
      t.string :secondary_logo

      t.timestamps
    end
    add_reference :design_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }, null: false

    Client.projects.find_each(&:create_design_setting)
  end
end
