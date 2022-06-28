# frozen_string_literal: true

class AddCreatedByUpdatedByIdToLibrary < ActiveRecord::Migration[5.2]
  def change
    add_reference :libraries, :created_by, foreign_key: { on_delete: :nullify, to_table: :users }
    add_reference :libraries, :updated_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
