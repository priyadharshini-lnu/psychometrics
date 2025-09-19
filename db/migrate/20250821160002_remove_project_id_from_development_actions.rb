# frozen_string_literal: true

class RemoveProjectIdFromDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    remove_reference :development_actions, :project
  end
end
