class Assessment < ApplicationRecord
  extend Mobility
end

class MigrateAsssessmentFieldsToMobility < ActiveRecord::Migration[7.0]
  def change
    Assessment.find_each do |t|
      attrs = t.attributes
      t.name = attrs['name']
      t.description = attrs['description']
      t.timing = attrs['timing']
      t.save!(validate: false)
    end
  end
end
