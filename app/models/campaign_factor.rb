# frozen_string_literal: true

class CampaignFactor < ApplicationRecord
  audited

  MAX_CAMPAIGN_FACTORS = 300

  belongs_to :campaign_factor_group
  belongs_to :campaign
  belongs_to :factor
  belongs_to :assessment
  include Tenantable

  has_one :dimension, through: :factor

  has_many :campaign_factor_values, dependent: :destroy
  has_many :campaign_ai_artifact_dependencies, class_name: 'AI::CampaignArtifactDependency',
            foreign_key: 'dependency_id', dependent: :destroy

  enum :factor_type, { assessment: 1, assessor_scoring: 2, formula: 3, external_score: 4 }
  enum :output_type, { numeric: 0, string: 1 }, suffix: true
  enum :assessment_score_type, { norm_score: 0, score: 1, zscore: 2, percentile: 3, percentage: 4 }

  before_create :set_position

  ransacker :factor_type, formatter: proc { |v| factor_types[v] }

  validate :validate_cyclic_path!

  scope :auto_moderated, -> { where(disallow_lead_assessor_moderation: true) }
  scope :manually_moderated, -> { where(disallow_lead_assessor_moderation: false) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id factor_type]
  end

  def auto_moderated?
    assessor_scoring? && disallow_lead_assessor_moderation?
  end

  def set_position
    self.position = (campaign_factor_group&.campaign_factors&.maximum('position') || 0) + 1
  end

  def dependencies_factor_code
    return @dependencies_factor_code if defined?(@dependencies_factor_code)
    return [] if formula.blank?

    @dependencies_factor_code = formula.scan(/__([a-zA-Z0-9_]+)/).flatten.uniq
  end

  def dependencies
    return @dependencies if defined?(@dependencies)

    return CampaignFactor.none if formula.blank?

    dependencies = campaign.campaign_factors.where(code: dependencies_factor_code)
    not_found_dependencies = dependencies_factor_code - dependencies.pluck(:code)
    if dependencies.length != dependencies_factor_code.length
      raise CampaignFactors::Exceptions::DependentFactorNotFound,
            "Dependent factor #{Utility::String.join_into_sentence(not_found_dependencies)} not found"
    end
    @dependencies = dependencies
  end

  def dependency_hash
    [*campaign.campaign_factors.where(factor_type: :formula), self].each_with_object({}) do |formula_factor, hash|
      hash[formula_factor.code] = formula_factor.dependencies_factor_code
    end
  end

  def validate_cyclic_path!
    has_cycle, cyclic_path = DetectCyclicDependency.call!(dependency_hash)
    return unless has_cycle

    errors.add(
      :formula,
      I18n.t(
        'activerecord.errors.models.campaign_factor.attributes.formula.cyclic_dependency_found',
        cyclic_path: cyclic_path.join(' -> ')
      )
    )
  end
end
