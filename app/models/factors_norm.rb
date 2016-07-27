# == Schema Information
#
# Table name: factors_norms
#
#  id         :integer          not null, primary key
#  level      :string
#  score_from :float
#  score_to   :float
#  type       :string
#  factor_id  :integer
#  norm_id    :integer
#

class FactorsNorm < ApplicationRecord
  belongs_to :factor
  belongs_to :norm

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  # norm types constant
  NORM_TYPES = %w(eti yti).freeze
  # factor types constant
  FACTOR_TYPES = %w(factors sub_factors).freeze

  LEVELS = ['Very Low', 'Low', 'Average', 'High', 'Very High'].freeze

  validates :level, :type, :factor, :norm, presence: true
  validates :type, inclusion: { in: NORM_TYPES }, allow_nil: true
  validates :level, inclusion: { in: LEVELS }, allow_nil: true
  validates :score_from, :score_to, numericality: true, allow_nil: true
  validate :score_from_less_than_score_to

  filterrific(
      default_filter_params: {
          by_factor_type: 'factors',
          by_norm_type: 'eti'
      },
      available_filters: [
                                 :by_factor_type,
                                 :by_norm_type
                             ]
  )

  scope :by_factor_type, lambda { |type|
    type = type.to_s
    raise "supported types: #{FACTOR_TYPES}" unless FACTOR_TYPES.include? type
    result = joins(:factor).where('factors.parent_id': nil) if type == 'factors'
    result = joins(:factor).where.not('factors.parent_id': nil) if type == 'sub_factors'
    result
  }

  scope :by_norm_type, lambda { |type|
    where('type': type)
  }

  private

  def score_from_less_than_score_to
    if score_from && score_to && score_from >= score_to
      errors[:score_to] << I18n.t('activerecord.errors.models.factors_norm.score_to_less_than_score_from')
    end
  end
end
