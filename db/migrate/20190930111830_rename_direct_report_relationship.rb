# frozen_string_literal: true

class RenameDirectReportRelationship < ActiveRecord::Migration[5.1]
  def change
    Relationship.find_by(name: 'DirectReport', type: :global).update!(name: 'Direct Report')
  end
end
