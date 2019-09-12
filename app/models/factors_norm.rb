# frozen_string_literal: true

# == Schema Information
#
# Table name: factors_norms
#
#  id        :integer          not null, primary key
#  type      :enum
#  factor_id :integer
#  norm_id   :integer
#  props     :json
#

class FactorsNorm < ApplicationRecord
  belongs_to :factor
  belongs_to :norm, touch: true

  after_initialize :init
  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  # norm types constant
  NORM_TYPES = %w[eti yti].freeze
  # factor types constant
  FACTOR_TYPES = %w[factors sub_factors].freeze

  LEVELS = ['Very Low', 'Low', 'Average', 'High', 'Very High'].freeze

  validates :type, :factor, :norm, presence: true
  validates :type, inclusion: { in: NORM_TYPES }, allow_nil: true
  validate :scoring_valid
  validate :score_from_less_than_score_to

  class << self
    #
    # Return structured collection
    # [
    #   {
    #     "id": <factor_id>,
    #     "name": <factor_name>,
    #     "parent": <Factor>,
    #     "factors_norms_props": <FactorNorm:props>
    #   },
    #   {
    #     "id": <factor_id>,
    #     "name": <factor_name>,
    #     "parent": <Factor>,
    #     "factors_norms_props": <FactorNorm:props>
    #   },
    # ]
    #
    #
    def structured_hash(scope)
      factors     = scope.select('factors.*, factors_norms.props as factors_norms_props').order('id': :asc).all
      parents_ids = factors.pluck(:parent_id).uniq.reject { |e| e.to_s.empty? }
      parents     = []
      parents = Factor.find(parents_ids).group_by(&:id) unless parents_ids.empty?
      factors.map do |factor|
        data                       = { id: factor.id, name: factor.name }
        data[:parent]              = parents[factor.parent_id].try(:[], 0) if factor.parent_id
        data[:factors_norms_props] = factor['factors_norms_props'] || []
        data
      end
    end

    #
    # Return list of structured hashes
    #
    # {
    #   "eti": {
    #     "factors": <structured_hash>
    #     "sub_factors": <structured_hash>
    #   },
    #   "yti": {
    #     "factors": <structured_hash>
    #     "sub_factors": <structured_hash>
    #   },
    # }
    #
    #
    def export_structured_hash(norm)
      FactorsNorm::NORM_TYPES.each_with_object(Hash.new({})) do |norm_type, sum|
        sum[norm_type] = {}
        FactorsNorm::FACTOR_TYPES.each do |factor_type|
          sql = Factor.where(dimension_id: norm.dimension_id).
                with_norm_type(norm_type, norm.id).
                with_factor_type(factor_type)
          sum[norm_type][factor_type] = FactorsNorm.structured_hash(sql)
        end
      end
    end

    def change_cell(params)
      factors_norm = FactorsNorm.find_or_create_by(
        norm_id:   params[:norm_id],
        factor_id: params[:factor_id],
        type:      params[:type]
      )
      cell         = factors_norm.props.detect { |item| item['level'] == params[:level] }
      value        = params[:field_value]
      if cell
        cell[params[:field_name]] = value
      else
        factors_norm.props << {
          level: params[:level],
          score_from: params[:field_name] == 'score_from' ? value : '',
          score_to: params[:field_name] == 'score_to' ? value : ''
        }
      end
      factors_norm.save
      factors_norm
    end
  end

  # Detects normed result based on scoring
  def detect_normed_result(scoring = [])
    # Calculates sum of value
    sum_scoring = scoring.inject(0) { |sum, result| sum + result['value'].to_i }
    # Calculates avg of value with 2 numbers after comma
    avg_scoring = (sum_scoring / scoring.size.to_f).round(2)

    prop = (props || []).detect { |n| n['score_from'].to_f <= avg_scoring && n['score_to'].to_f >= avg_scoring }

    # Converts level to index
    normed_result = LEVELS.index(prop&.dig('level'))
    # +1 cause (Very Low = 1, Low = 2, Average = 3, High = 4, Very High = 5)
    normed_result + 1 if normed_result
  end

  private

  def score_from_less_than_score_to
    props.each do |item|
      if item['score_from'].present? && item['score_to'].present? && item['score_from'].to_f >= item['score_to'].to_f
        errors[:props] << I18n.t('activerecord.errors.models.factors_norm.score_to_less_than_score_from')
      end
    end
  end

  def scoring_valid
    props.each do |item|
      if item['score_to'].present?
        unless item['score_to'].to_s.valid_float?
          errors[:props] << I18n.t('activerecord.errors.models.factors_norm.score_to_must_be_number')
        end
      end
      next unless item['score_from'].present?

      unless item['score_from'].to_s.valid_float?
        errors[:props] << I18n.t('activerecord.errors.models.factors_norm.score_from_must_be_number')
      end
    end
  end

  def init
    self.props ||= []
  end
end
