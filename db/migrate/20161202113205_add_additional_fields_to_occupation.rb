class AddAdditionalFieldsToOccupation < ActiveRecord::Migration[5.0]
  def change
    add_column :occupations, :full_description, :text
    add_column :occupations, :potential_areas_of_study, :text
    add_column :occupations, :key_career_tracks, :text
    add_column :occupations, :high_school_entry_roles, :text
    add_column :occupations, :diploma_qualification, :text
    add_column :occupations, :bachelors_or_masters_qualification, :text
  end
end
