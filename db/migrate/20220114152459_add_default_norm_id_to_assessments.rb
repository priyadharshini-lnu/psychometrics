# frozen_string_literal: true

class AddDefaultNormIdToAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :assessments, :default_norm_id, :integer
  end
end
