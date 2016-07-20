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

  # Types constant
  TYPES = {
      yti: 'yti',
      eti: 'eti'
  }.freeze

  LEVELS = %w(all users administrators)

  validates :level, :type, :factor, :norm, presence: true
  validates :type, inclusion: { in: TYPES.values }, allow_nil: true
  validates :score_from, :score_to, numericality: true, allow_nil: true
  validate :score_from_less_than_score_to

  private

  def score_from_less_than_score_to
    if score_from && score_to && score_from >= score_to
      errors[:score_to] << I18n.t('activerecord.errors.models.factors_norm.score_to_less_than_score_from')
    end
  end
end
