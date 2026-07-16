# frozen_string_literal: true

class Api::V2::Administration::Dimensions::InnovationStyles::InnovationStylesFactorResource < Api::V2::Administration::BaseResource
  model_name 'InnovationStylesFactor'

  attributes :factor_id, :factor_name, :predicate, :value, :position, :weight, :created_at, :updated_at

  ransack_filters %i[filterable_fields search_query]

  def self.sortable_fields(context)
    super + %i[name condition created_at updated_at]
  end

  def self.apply_sort(records, order_options, context = {})
    order_options.each do |field, direction|
      records = case field.to_s
                  when 'condition'
                    super(records, { predicate: direction }, context)
                  when 'name'
                    sort_direction = direction.to_s == 'desc' ? :desc : :asc
                    records.joins(:factor).reorder(Factor.arel_table[:name].send(sort_direction))
                  else
                    super(records, { field => direction }, context)
                end
    end

    records
  end

  def factor_name
    @model.factor&.name
  end

  def created_at
    @model.created_at&.iso8601
  end

  def updated_at
    @model.updated_at&.iso8601
  end

  before_create do
    @model.innovation_style_id = context[:params][:innovation_style_id]
  end

  def self.records(opts)
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, InnovationStylesFactor]).
      includes(:factor).
      where(innovation_style_id: opts[:context][:params][:innovation_style_id])
  end
end
