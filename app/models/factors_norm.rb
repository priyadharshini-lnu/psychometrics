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

  private

  def score_from_less_than_score_to
    if score_from && score_to && score_from >= score_to
      errors[:score_to] << I18n.t('activerecord.errors.models.factors_norm.score_to_less_than_score_from')
    end
  end
end
