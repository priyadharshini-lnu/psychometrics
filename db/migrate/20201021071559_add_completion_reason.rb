# frozen_string_literal: true

class AddCompletionReason < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :completion_reason, :integer
  end
end
