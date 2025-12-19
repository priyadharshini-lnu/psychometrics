# frozen_string_literal: true

# STI model for AI-assisted artifact results sessions.
class AI::CampaignArtifactResult < AI::AssistedUserSession
  include RansackSearchableFields

  validates :assistable_type, inclusion: { in: ['AI::CampaignArtifact'] }
  validates :user_id, uniqueness: { scope: %i[assistable_id assistable_type] }

  belongs_to :campaign_ai_artifact, class_name: 'AI::CampaignArtifact', foreign_key: :assistable_id
  has_many :assistant_output_schema_keys, through: :campaign_ai_artifact, source: :assistant_output_schema_keys

  alias_attribute :results, :checkpoint

  def parsed_dependencies
    # nil as default if no parsed dependencies are stored
    meta.present? && meta != {} ? meta : nil
  end

  def parsed_dependencies=(value)
    self.meta = value
  end

  before_save :reset_error, if: :results_changed?

  validate :validate_results_schema, if: :results_changed?

  def schema_keys_result
    schema_keys = assistant_output_schema_keys.pluck(:key, :key_type).to_h
    results_hash = results || {}

    schema_keys.map do |key, key_type|
      { key: key, value: results_hash[key.to_s], type: key_type }
    end
  end

  def schema_keys_changed?
    original_keys = assistant_output_schema_keys.pluck(:key).map(&:to_s)
    current_keys = (results || {}).keys

    original_keys.sort != current_keys.sort
  end

  def campaign_ai_artifact_id
    assistable_id
  end

  def self.ransackable_scopes(_)
    %i[filterable_fields]
  end

  private

  def reset_error
    self.error = nil
  end

  def validate_results_schema
    validation_errors = campaign_ai_artifact.validate_results_schema(results)

    validation_errors.each do |error_message|
      errors.add(:results, error_message)
    end
  end
end
