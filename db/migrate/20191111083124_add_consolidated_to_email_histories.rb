# frozen_string_literal: true

class AddConsolidatedToEmailHistories < ActiveRecord::Migration[5.1]
  def change
    add_column :threesixty_email_histories, :consolidated, :boolean, default: false
  end
end
