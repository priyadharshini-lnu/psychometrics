class AddGlobalRelationships < ActiveRecord::Migration[5.1]
  def change
    Relationship.create(name: 'Manager', type: :global)
    Relationship.create(name: 'Peer', type: :global)
    Relationship.create(name: 'Self', type: :global)
    Relationship.create(name: 'DirectReport', type: :global)
  end
end
