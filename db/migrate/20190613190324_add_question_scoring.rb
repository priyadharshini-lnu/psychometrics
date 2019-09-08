# frozen_string_literal: true

class AddQuestionScoring < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :question_scoring, :jsonb, default: []
  end
end
