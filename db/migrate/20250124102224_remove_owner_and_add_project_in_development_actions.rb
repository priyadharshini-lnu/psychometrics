# frozen_string_literal: true

class RemoveOwnerAndAddProjectInDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    if column_exists?(:development_actions, :owner_id)
      remove_reference :development_actions, :owner
    end
    add_reference :development_actions, :project, null: true, foreign_key: {
      to_table: :clients,
      on_delete: :cascade
    }
  end
end
