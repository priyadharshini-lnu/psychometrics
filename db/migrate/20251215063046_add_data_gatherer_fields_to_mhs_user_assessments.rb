# frozen_string_literal: true

class AddDataGathererFieldsToMhsUserAssessments < ActiveRecord::Migration[8.0]
  def change
    change_table :mhs_user_assessments, bulk: true do |t|
      t.string :data_gatherer_id
      t.string :data_gathering_id
    end
  end
end
