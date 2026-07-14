# frozen_string_literal: true

class Api::V2::Administration::Dimensions::OccupationConditionSetResource < Api::V2::Administration::BaseResource
  attributes :name, :score_type, :conditions_count, :is_default, :created_at, :updated_at

  ransack_filters %i[filterable_fields search_query]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, record) { record.slice(:id, :name) }

  def self.records(opts)
    ::Pundit.policy_scope!(
      opts[:context][:user],
      [:api, :administration, OccupationConditionSet]
    ).where(dimension_id: opts[:context][:params][:dimension_id]).includes(:dimension)
  end

  def conditions_count
    @model.occupations_factors.count
  end

  # rubocop:disable Naming/PredicatePrefix
  def is_default
    @model.id == @model.dimension.default_occupation_condition_set_id
  end
  # rubocop:enable Naming/PredicatePrefix

  before_create do
    @model.dimension_id = context[:params][:dimension_id]
  end
end
