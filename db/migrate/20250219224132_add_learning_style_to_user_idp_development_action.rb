# frozen_string_literal: true

class AddLearningStyleToUserIdpDevelopmentAction < ActiveRecord::Migration[7.1]
  def change
    unless column_exists?(:user_idp_development_actions, :custom_learning_style)
      add_column :user_idp_development_actions, :custom_learning_style, :integer, null: true
    end
  end
end
