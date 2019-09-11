# frozen_string_literal: true

class AddSelfRelationship < ActiveRecord::Migration[5.1]
  def change
    Relationship.reset_column_information
    Relationship.create(name: 'Self', type: :global, assign_type: :automatic)
  end
end
