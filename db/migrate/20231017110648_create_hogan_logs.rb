class CreateHoganLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :hogan_logs do |t|
      t.string :log_type
      t.string :participant_id
      t.string :group
      t.jsonb :response
      t.jsonb :meta
      t.jsonb :call_stack

      t.datetime :created_at,   null: false
    end
  end
end
