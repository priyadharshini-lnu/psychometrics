# frozen_string_literal: true

class AddNewCpiFieldsToOccupations < ActiveRecord::Migration[5.1]
  def change
    add_column :occupations, :work_environment, :text
    add_column :occupations, :color, :string
    add_column :occupations, :alternative_icon, :string
    add_column :occupations, :indicative_roles_image, :string
    add_column :occupations, :key_career_tracks_image, :string
  end
end
