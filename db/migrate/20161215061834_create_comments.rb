class CreateComments < ActiveRecord::Migration[5.0]
  def change
    add_column :comments, :commentable_id, :integer
    add_column :comments, :commentable_type, :string
    remove_column :comments, :question_id
  end
end
