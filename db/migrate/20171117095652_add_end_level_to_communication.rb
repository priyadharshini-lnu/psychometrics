class AddEndLevelToCommunication < ActiveRecord::Migration[5.0]
  def change
    add_reference :communications, :end_level, foreign_key: { on_delete: :cascade, to_table: :clients}
  end
end
