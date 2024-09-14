# frozen_string_literal: true

class OccupationSerializer < Panko::Serializer
  attributes :id, :name, :description, :factors, :full_description, :potential_areas_of_study, :icon,
             :key_career_tracks, :high_school_entry_roles, :diploma_qualification, :bachelors_or_masters_qualification,
             :work_environment, :alternative_icon, :indicative_roles_image, :key_career_tracks_image, :color

  def factors
    Panko::ArraySerializer.new(
      object.occupations_factors,
      each_serializer: OccupationsFactorSerializer
    ).to_a
  end

  def icon
    object.icon.url
  end

  def alternative_icon
    object.alternative_icon.url
  end

  def indicative_roles_image
    object.indicative_roles_image.url
  end

  def key_career_tracks_image
    object.key_career_tracks_image.url
  end
end
