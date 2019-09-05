class AddOccupationsEnabledAndInnovationStylesEnabledBooleansToDimensions < ActiveRecord::Migration[5.1]
  def change
    add_column :dimensions, :occupations_enabled, :boolean, default: false, null: false
    add_column :dimensions, :innovation_styles_enabled, :boolean, default: false, null: false
  end
end
