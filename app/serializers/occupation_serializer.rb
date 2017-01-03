# == Schema Information
#
# Table name: occupations
#
#  id                                 :integer          not null, primary key
#  name                               :string
#  icon                               :string
#  description                        :text
#  dimension_id                       :integer
#  created_at                         :datetime         not null
#  updated_at                         :datetime         not null
#  full_description                   :text
#  potential_areas_of_study           :text
#  key_career_tracks                  :text
#  high_school_entry_roles            :text
#  diploma_qualification              :text
#  bachelors_or_masters_qualification :text
#

class OccupationSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :factors, :full_description, :potential_areas_of_study,
             :key_career_tracks, :high_school_entry_roles, :diploma_qualification, :bachelors_or_masters_qualification

  def factors
    object.occupations_factors.map do |obj|
      OccupationsFactorSerializer.new(obj)
    end
  end
end
