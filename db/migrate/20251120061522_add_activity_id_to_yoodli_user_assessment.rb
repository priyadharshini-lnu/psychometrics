# frozen_string_literal: true

class AddActivityIdToYoodliUserAssessment < ActiveRecord::Migration[8.0]
  def change
    add_column :yoodli_user_assessments, :yoodli_activity_id, :string
  end
end
