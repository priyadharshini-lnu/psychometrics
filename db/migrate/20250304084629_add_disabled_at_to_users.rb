# frozen_string_literal: true

class AddDisabledAtToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :disabled_at, :datetime
  end
end
