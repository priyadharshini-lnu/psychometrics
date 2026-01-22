# frozen_string_literal: true

class AddObservationItemSetsToMhsUserAssessments < ActiveRecord::Migration[8.0]
  def change
    add_column :mhs_user_assessments, :observation_item_sets, :json
  end
end
