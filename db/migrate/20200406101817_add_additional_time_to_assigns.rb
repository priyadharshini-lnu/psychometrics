# frozen_string_literal: true

class AddAdditionalTimeToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :additional_time, :integer
  end
end
