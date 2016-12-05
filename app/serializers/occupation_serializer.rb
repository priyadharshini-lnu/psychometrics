class OccupationSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :factors, :full_description, :potential_areas_of_study,
             :key_career_tracks, :high_school_entry_roles, :diploma_qualification, :bachelors_or_masters_qualification

  def factors
    object.occupations_factors.map do |obj|
      OccupationsFactorSerializer.new(obj)
    end
  end
end
