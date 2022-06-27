# frozen_string_literal: true

class AddCreatedByUpdatedByIdToDimension < ActiveRecord::Migration[5.2]
  def change
    add_reference :dimensions, :created_by, foreign_key: { on_delete: :nullify, to_table: :users }
    add_reference :dimensions, :updated_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
