# frozen_string_literal: true

class AddUpdatedByIdToCommunications < ActiveRecord::Migration[5.2]
  def change
    add_reference :communications, :updated_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
