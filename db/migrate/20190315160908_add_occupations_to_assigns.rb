class AddOccupationsToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :occupations, :jsonb, default: []
  end
end
