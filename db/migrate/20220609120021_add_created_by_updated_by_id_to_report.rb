# frozen_string_literal: true

class AddCreatedByUpdatedByIdToReport < ActiveRecord::Migration[5.2]
  def change
    add_reference :reports, :created_by, foreign_key: { on_delete: :nullify, to_table: :users }
    add_reference :reports, :updated_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
