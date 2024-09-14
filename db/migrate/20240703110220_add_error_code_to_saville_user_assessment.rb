# frozen_string_literal: true

class AddErrorCodeToSavilleUserAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :saville_user_assessments, :error_code, :string
  end
end
