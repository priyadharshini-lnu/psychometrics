# frozen_string_literal: true

class RemoveCustomActionColumnsFromUserIdpDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    change_table :user_idp_development_actions, bulk: true do |t|
      t.remove :custom_action, type: :text
      t.remove :custom_action_learning_style, type: :integer
    end
  end
end
