# frozen_string_literal: true

class Api::V2::Administration::Dimensions::OccupationResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :full_description, :potential_areas_of_study, :key_career_tracks,
             :high_school_entry_roles, :diploma_qualification, :bachelors_or_masters_qualification, :work_environment,
             :color, :icon_url, :alternative_icon_url, :indicative_roles_image_url, :key_career_tracks_image_url,
             :created_at, :updated_at

  ransack_filters %i[filterable_fields search_query]

  delegate :icon_url, :alternative_icon_url, :indicative_roles_image_url, :key_career_tracks_image_url, to: :@model

  before_create do
    @model.dimension_id = context[:params][:dimension_id]
  end

  def self.records(opts)
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, Occupation]).
      where(dimension_id: opts[:context][:params][:dimension_id]).
      with_attached_icon.
      with_attached_alternative_icon.
      with_attached_indicative_roles_image.
      with_attached_key_career_tracks_image
  end
end
