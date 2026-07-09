# frozen_string_literal: true

class Api::V2::Administration::DimensionResource < Api::V2::Administration::BaseResource
  attributes :name, :disabled, :created_at, :updated_at, :occupations_enabled, :innovation_styles_enabled,
             :default_occupation_condition_set_id

  has_one :owner
  ransack_filters %i[filterable_fields]

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::DimensionPolicy,
          context[:user],
          @model,
          %w[copy export_json],
          {
            project_id: @model.owner_id
          }
        )
      }
    }
  end
end
