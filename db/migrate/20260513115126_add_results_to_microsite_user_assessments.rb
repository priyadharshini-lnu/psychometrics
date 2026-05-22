# frozen_string_literal: true

class AddResultsToMicrositeUserAssessments < ActiveRecord::Migration[8.0]
  def change
    change_table :microsite_user_assessments, bulk: true do |t|
      t.jsonb :answers, default: {}, null: false
      t.datetime :completed_at
    end
  end
end
