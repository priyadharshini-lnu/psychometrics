# frozen_string_literal: true

class Api::V2::Administration::Dimensions::Occupations::OccupationsFactorResource < Api::V2::Administration::BaseResource
  model_name 'OccupationsFactor'

  attributes :factor_id, :factor_name, :predicate, :value, :position, :weight, :created_at, :updated_at,
             :condition_set_id

  ransack_filters %i[filterable_fields search_query]
  filter :condition_set_id, apply: lambda { |records, value, _options|
    records.where(occupation_condition_set_id: value)
  }

  def factor_name
    @model.factor&.name
  end

  def condition_set_id
    @model.occupation_condition_set_id
  end

  def condition_set_id=(val)
    @model.occupation_condition_set_id = val
  end

  def created_at
    @model.created_at&.iso8601
  end

  def updated_at
    @model.updated_at&.iso8601
  end

  before_create do
    @model.occupation_id = context[:params][:occupation_id]
    @model.occupation_condition_set_id ||= context[:params][:occupation_condition_set_id]
  end

  def self.records(opts)
    ::Pundit.policy_scope!(
      opts[:context][:user],
      [:api, :administration, OccupationsFactor]
    ).includes(:factor).
      where(occupation_id: opts[:context][:params][:occupation_id])
  end
end
