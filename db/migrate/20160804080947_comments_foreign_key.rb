class CommentsForeignKey < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :comments, column: :created_by
    add_foreign_key :comments, :users, column: :created_by, on_delete: :nullify
  end
end
