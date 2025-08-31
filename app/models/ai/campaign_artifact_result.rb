# frozen_string_literal: true

class AI::CampaignArtifactResult < ApplicationRecord
  self.table_name = 'campaign_ai_artifact_results'

  belongs_to :user
  belongs_to :campaign_ai_artifact, class_name: 'AI::CampaignArtifact'
  has_many :assistant_output_schema_keys, through: :campaign_ai_artifact, source: :assistant_output_schema_keys

  before_save :reset_error, if: :results_changed?

  validate :validate_results_schema, if: :results_changed?

  def schema_keys_result
    schema_keys = assistant_output_schema_keys.pluck(:key, :key_type).to_h

    schema_keys.map do |key, key_type|
      { key: key, value: results[key.to_s], type: key_type }
    end
  end

  def schema_keys_changed?
    original_keys = assistant_output_schema_keys.pluck(:key).map(&:to_s)
    current_keys = (results || {}).keys

    original_keys.sort != current_keys.sort
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
