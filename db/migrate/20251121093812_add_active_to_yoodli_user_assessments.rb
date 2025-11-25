# frozen_string_literal: true

class AddActiveToYoodliUserAssessments < ActiveRecord::Migration[8.0]
  def change
    add_column :yoodli_user_assessments, :active, :boolean, default: true, null: false
    add_index :yoodli_user_assessments, :active
  end
end
