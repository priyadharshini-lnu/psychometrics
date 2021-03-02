# frozen_string_literal: true

class AddDefaultRelationToUserAssessment < ActiveRecord::Migration[5.2]
  def change
    self_relationship = Relationship.self_relationship

    UserAssessment.where(relationship_id: nil).find_each do |ua|
      ua.update!(relationship: self_relationship)
    end

    UsersResult.where(started_at: nil).find_each do |ur|
      ur.update!(started_at: ur.created_at)
    end
  end
end
