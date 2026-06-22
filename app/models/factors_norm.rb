# frozen_string_literal: true

class FactorsNorm < ApplicationRecord
  audited

  belongs_to :factor
  belongs_to :norm, touch: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :norm, :factor

  after_initialize :init
  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  # factor types constant
  FACTOR_TYPES = %w[factors sub_factors].freeze

  LEVELS = ['Very Low', 'Low', 'Average', 'High', 'Very High'].freeze

  validates :factor, :norm, presence: true
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
      factors = scope.select('factors.*, factors_norms.props as factors_norms_props').order(id: :asc).all
      factors.map do |factor|
        data                       = { id: factor.id, name: factor.name }
        data[:factors_norms_props] = factor['factors_norms_props'] || []
        data
      end
    end

    def export_structured_hash(norm)
      sql = Factor.where(dimension_id: norm.dimension_id).with_norm(norm.id)
      structured_hash(sql)
    end

    def change_cell(params)
      factors_norm = FactorsNorm.find_or_create_by(
        norm_id:   params[:norm_id],
        factor_id: params[:factor_id]
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

    calc_norm_level(avg_scoring)
  end

  def calc_norm_level(score)
    return nil unless score

    factor_norm = (props || []).sort_by { |n| n['score_from'].to_f }

    prop = factor_norm.detect { |n| score.between?(n['score_from'].to_f, n['score_to'].to_f) }

    # Converts level to index
    normed_result = LEVELS.index(prop&.dig('level'))
    # +1 cause (Very Low = 1, Low = 2, Average = 3, High = 4, Very High = 5)
    normed_result + 1 if normed_result
  end

  private

  def score_from_less_than_score_to
    props.each do |item|
      next unless item['score_from'].present? &&
                  item['score_to'].present? &&
                  item['score_from'].to_f >= item['score_to'].to_f

      errors.add(
        :props,
        I18n.t('activerecord.errors.models.factors_norm.score_to_less_than_score_from')
      )
    end
  end

  def scoring_valid
    props.each do |item|
      if item['score_to'].present? && !item['score_to'].to_s.valid_float?
        errors.add(
          :props,
          I18n.t('activerecord.errors.models.factors_norm.score_to_must_be_number')
        )
      end

      next if item['score_from'].blank?
      next if item['score_from'].to_s.valid_float?

      errors.add(
        :props,
        I18n.t('activerecord.errors.models.factors_norm.score_from_must_be_number')
      )
    end
  end

  def init
    self.props ||= []
  end
end
