# frozen_string_literal: true

class AddLastRanAtToCommunication < ActiveRecord::Migration[5.2]
  def change
    add_column :communications, :last_ran_at, :datetime
  end
end
