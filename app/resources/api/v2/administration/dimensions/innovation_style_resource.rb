# frozen_string_literal: true

class Api::V2::Administration::Dimensions::InnovationStyleResource < Api::V2::Administration::BaseResource
  attributes :id, :name, :description, :full_description, :position, :icon_url, :created_at, :updated_at

  ransack_filters %i[filterable_fields search_query]

  delegate :icon_url, to: :@model

  before_create do
    @model.dimension_id = context[:params][:dimension_id]
  end

  def self.records(opts)
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, InnovationStyle]).
      where(dimension_id: opts[:context][:params][:dimension_id])
  end
end
