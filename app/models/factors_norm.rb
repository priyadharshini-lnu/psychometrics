# == Schema Information
#
# Table name: factors_norms
#
#  id         :integer          not null, primary key
#  level      :string
#  score_from :float
#  score_to   :float
#  type       :enum
#  factor_id  :integer
#  norm_id    :integer
#  props      :json
#

class FactorsNorm < ApplicationRecord
  belongs_to :factor
  belongs_to :norm

  after_initialize :init
  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  # norm types constant
  NORM_TYPES              = %w(eti yti).freeze
  # factor types constant
  FACTOR_TYPES            = %w(factors sub_factors).freeze

  LEVELS = ['Very Low', 'Low', 'Average', 'High', 'Very High'].freeze

  validates :type, :factor, :norm, presence: true
  validates :type, inclusion: {in: NORM_TYPES}, allow_nil: true
  validates :score_from, :score_to, numericality: true, allow_nil: true
  validate :score_from_less_than_score_to

  class << self
    #
    # Return structured collection
    # [
    #   {
    #     "id": <factor_id>,
    #     "name": <factor_name>,
    #     "parent": <Factor>,
    #     "factors_norm": <FactorNorm
    #   },
    #   {
    #     "id": <factor_id>,
    #     "name": <factor_name>,
    #     "parent": <Factor>,
    #     "factors_norm": <FactorNorm
    #   },
    # ]
    #
    #
    def structured_hash(scope, norm_id)
      factors = scope.includes(:factors_norms).where(factors_norms: {norm_id: norm_id}).all
      parents_ids = factors.pluck(:parent_id).uniq.reject { |e| e.to_s.empty? }
      parents     = []
      unless parents_ids.empty?
        parents = Factor.find(parents_ids).group_by(&:id)
      end
      factors.map do |factor|
        data                = {id: factor.id, name: factor.name}
        data[:parent]       = parents[factor.parent_id].try(:[], 0) if factor.parent_id
        data[:factors_norm] = factor.factors_norms.try(:[], 0)
        Rails.logger.warn "data #{data}"
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
    def export_structured_hash(norm_id)
      FactorsNorm::NORM_TYPES.inject(Hash.new({})) do |sum, norm_type|
        sum[norm_type] = {}
        FactorsNorm::FACTOR_TYPES.each do |factor_type|
          sql                         = FactorsNorm.with_norm_type(norm_type).with_factor_type(factor_type).where(norm_id: norm_id)
          sum[norm_type][factor_type] = FactorsNorm.structured_hash(sql, norm_id)
        end
        sum
      end
    end

    def change_cell(params)
      factors_norm = FactorsNorm.find_or_create_by(
                      norm_id: params[:norm_id],
                      factor_id: params[:factor_id],
                      type: params[:type]
                  )
      Rails.logger.warn "factors_norm[1] #{factors_norm.props}"
      cell = factors_norm.props.find { |cell| cell['level'] == params[:level] }
      if cell
        cell[params[:field_name]] = params[:field_value].to_f
      else
        factors_norm.props << {
            level: params[:level],
            score_from: params[:field_name] == 'score_from' ? params[:field_value].to_f : '',
            score_to: params[:field_name] == 'score_to' ? params[:field_value].to_f : '',
        }
      end
      factors_norm.save
      Rails.logger.warn "factors_norm[2] #{factors_norm.props}"
    end
  end

  private

  def score_from_less_than_score_to
    if score_from && score_to && score_from >= score_to
      errors[:score_to] << I18n.t('activerecord.errors.models.factors_norm.score_to_less_than_score_from')
    end
  end

  def init
    self.props ||= []
  end
end
