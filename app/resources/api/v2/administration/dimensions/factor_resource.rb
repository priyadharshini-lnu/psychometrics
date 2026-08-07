# frozen_string_literal: true

class Api::V2::Administration::Dimensions::FactorResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :code, :scoring_strategy, :parent, :disabled, :precision, :scale_min, :scale_max,
             :icon_url, :score_min, :score_max, :use_sub_factor_norm_score,
             :score_definitions, :what_to_look_for, :use_percentage, :custom_formula,
             :factors_sub_factors, :child_factor_type, :created_at, :updated_at,
             :questions_count_by_assessment_details, :external_scoring

  has_many :sub_factors, relation_name: :factors_sub_factors, class_name: 'FactorsSubFactor'
  has_many :parent_factors
  has_one :dimension

  ransack_filters %i[filterable_fields search_query]

  filter :scoring_strategy_in, apply: lambda { |records, value, _|
    raw_values = if value.is_a?(Array)
                   value
                 else
                   value.to_s.split(',')
                 end

    filter_values = raw_values.filter_map do |raw_value|
      normalized_value = raw_value.to_s.strip
      next if normalized_value.blank?

      if normalized_value.match?(/\A\d+\z/)
        normalized_value.to_i
      else
        Factor.scoring_strategies[normalized_value]
      end
    end

    records.ransack(scoring_strategy_in: filter_values).result
  }

  def self.sortable_fields(context)
    super + %i[id name scoring_strategy created_at updated_at]
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::FactorPolicy,
          context[:user],
          @model,
          ['copy'],
          {
            project_id: @model.dimension.owner_id
          }
        )
      }
    }
  end

  def parent
    %w[sub_factor_questions
       sub_factors_average
       sub_factors_conditional_average
       sub_factor_questions_sum
       external_score
       sub_factors_sum].include?(@model.scoring_strategy)
  end

  def factors_sub_factors=(value)
    @pending_sub_factors = value
  end

  after_create do
    process_sub_factors if @pending_sub_factors.present?
  end

  after_update do
    process_sub_factors if @pending_sub_factors.present?
  end

  def process_sub_factors
    Administration::Factors::CreateOrUpdateFactorSubFactors.call(@model, @model.dimension, @pending_sub_factors)
    @pending_sub_factors = nil
  end

  delegate :icon_url, to: :@model

  def self.records(opts)
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, Factor]).
      where(dimension_id: opts[:context][:params][:dimension_id]).
      without_indicators.
      with_attached_icon.
      includes(:translations, :dimension)
  end
end
