# frozen_string_literal: true

class AddCreatedByUpdatedByIdToQuestions < ActiveRecord::Migration[5.2]
  def change
    add_reference :questions, :created_by, foreign_key: { on_delete: :nullify, to_table: :users }
    add_reference :questions, :updated_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
