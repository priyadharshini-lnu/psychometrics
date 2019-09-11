# frozen_string_literal: true

class AddReferenceFromCommunicationsToUser < ActiveRecord::Migration[5.0]
  def change
    add_reference :communications, :creator, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
