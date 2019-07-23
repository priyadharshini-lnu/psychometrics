class AddSelfRelationship < ActiveRecord::Migration[5.1]
  def change
    Relationship.create(name: 'Self', type: :global, assign_type: :automatic)
  end
end
