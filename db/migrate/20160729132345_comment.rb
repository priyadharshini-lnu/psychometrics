class Comment < ActiveRecord::Migration[5.0]
  def change
    create_table :comments do |t|
      t.string :text
      t.integer :created_by, null: true

      t.timestamps
    end
    add_reference :comments, :question
    add_foreign_key :comments, :users, column: :created_by
  end
end
