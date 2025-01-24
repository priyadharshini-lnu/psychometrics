class RenameOwnerToProjectInSkills < ActiveRecord::Migration[7.0]
    def change
      if column_exists?(:skills, :owner_id)
        remove_reference :skills, :owner
      end
        add_reference :skills, :project, null: true, foreign_key: { to_table: :clients, on_delete: :cascade }
    end
  end