# frozen_string_literal: true

desc 'Seed relationships'
task seed_relationships: :environment do
  relationships = [
    {
      name: 'Direct Report',
      type: :global,
      assign_type: :manual
    },
    {
      name: 'Assessor',
      type: :global,
      assign_type: :manual
    },
    {
      name: 'Self',
      type: :global,
      assign_type: :automatic
    },
    {
      name: 'Manager',
      type: :global,
      assign_type: :manual
    },
    {
      name: 'Peer',
      type: :global,
      assign_type: :manual
    }
  ]

  relationships.each do |attrs|
    Relationship.find_or_create_by!(name: attrs[:name]) do |relationship|
      relationship.type = attrs[:type]
      relationship.assign_type = attrs[:assign_type]
    end
  end

  puts "Created #{relationships.length} relationships"
end
