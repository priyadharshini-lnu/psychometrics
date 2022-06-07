# frozen_string_literal: true

class AddRestartedToUserAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :user_assessments, :progress_reseted, :boolean, default: false
  end
end
