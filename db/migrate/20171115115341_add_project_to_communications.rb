# frozen_string_literal: true

class AddProjectToCommunications < ActiveRecord::Migration[5.0]
  def change
    add_reference :communications, :project, foreign_key: { on_delete: :cascade, to_table: :clients }
  end
end
