# frozen_string_literal: true

class ChangeDevelopmentActionsNameToOptional < ActiveRecord::Migration[7.1]
  def change
    change_column_null :development_actions, :name, true
  end
end
