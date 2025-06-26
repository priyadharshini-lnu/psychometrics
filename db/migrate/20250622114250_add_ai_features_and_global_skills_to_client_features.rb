# frozen_string_literal: true

class AddAIFeaturesAndGlobalSkillsToClientFeatures < ActiveRecord::Migration[7.1]
  def change
    change_table :client_features, bulk: true do |t|
      t.boolean :ai_assisted_idp, default: false, null: false
      t.boolean :ai_assistants, default: false, null: false
      t.boolean :global_skills, default: false, null: false
    end
  end
end
