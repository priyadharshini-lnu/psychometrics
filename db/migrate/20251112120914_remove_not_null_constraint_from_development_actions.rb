# frozen_string_literal: true

class RemoveNotNullConstraintFromDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    change_table :development_actions, bulk: true do |t|
      t.change_null :name, true
      t.change_null :description, true
    end
  end
end
