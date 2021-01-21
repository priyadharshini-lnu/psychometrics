# frozen_string_literal: true

class AddAssessor < ActiveRecord::Migration[5.2]
  def change
    Relationship.create(name: Relationship::ASSESSOR, type: :global)
  end
end
