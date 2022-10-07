# frozen_string_literal: true

class AddPhotoToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :photo, :string
    add_column :users, :timezone, :string
  end
end
