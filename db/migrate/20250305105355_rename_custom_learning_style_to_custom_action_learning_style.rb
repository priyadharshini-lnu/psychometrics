# frozen_string_literal: true

class RenameCustomLearningStyleToCustomActionLearningStyle < ActiveRecord::Migration[7.1]
  def change
    rename_column :user_idp_development_actions, :custom_learning_style, :custom_action_learning_style
  end
end
