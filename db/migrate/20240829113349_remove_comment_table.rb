# frozen_string_literal: true

class RemoveCommentTable < ActiveRecord::Migration[7.1]
  def up
    drop_table :comments
  end

  def down
    create_table(:comments, &:timestamps)
  end
end
