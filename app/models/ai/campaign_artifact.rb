# frozen_string_literal: true

class AI::CampaignArtifact < ApplicationRecord
  self.table_name = 'campaign_ai_artifacts'

  MAX_CAMPAIGN_AI_ARTIFACTS = 50

  belongs_to :ai_assistant, class_name: 'AI::Assistant'
  belongs_to :campaign

  has_many :results,
           -> { where(type: 'AI::CampaignArtifactResult') },
           as: :assistable,
           class_name: 'AI::CampaignArtifactResult',
           dependent: :destroy
  has_many :assistant_output_schema_keys, through: :ai_assistant, source: :assistant_output_schema_keys
  has_many :dependencies, class_name: 'AI::CampaignArtifactDependency',
            foreign_key: 'campaign_ai_artifact_id', dependent: :destroy

  has_many :questions, -> { where(campaign_ai_artifact_dependencies: { dependency_type: 'Question' }) },
           through: :dependencies,
           source: :dependency,
           source_type: 'Question'

  has_many :campaign_factors, -> { where(campaign_ai_artifact_dependencies: { dependency_type: 'CampaignFactor' }) },
           through: :dependencies,
           source: :dependency,
           source_type: 'CampaignFactor'

  has_many :sheet_columns, -> { where(campaign_ai_artifact_dependencies: { dependency_type: 'SheetColumn' }) },
           through: :dependencies,
           source: :dependency,
           source_type: 'SheetColumn'

  accepts_nested_attributes_for :dependencies, allow_destroy: true

  def validate_results_schema(results)
    errors = []

    validate_results_keys(results, errors)
    validate_results_types(results, errors)

    errors
  end

  private

  def validate_results_keys(results, errors)
    expected_keys = assistant_output_schema_keys.pluck(:key).map(&:to_s)
    actual_keys = (results || {}).stringify_keys.keys

    missing_keys = expected_keys - actual_keys
    extra_keys = actual_keys - expected_keys

    if missing_keys.any?
      # Translations are not required as it will be consumed by LLMs
      errors << "is missing required keys: #{missing_keys.join(', ')}"
    end

    if extra_keys.any?
      # Translations are not required as it will be consumed by LLMs
      errors << "contains unexpected keys: #{extra_keys.join(', ')}"
    end
  end

  def validate_results_types(results, errors)
    actual_results = (results || {}).stringify_keys
    assistant_output_schema_keys.each do |osk|
      key = osk.key.to_s
      next unless actual_results.key?(key)

      value = actual_results[key]
      expected_type = osk.key_type

      unless value_is_type?(value, expected_type)
        errors << "#{key} should be a #{expected_type}"
      end
    end
  end

  def value_is_type?(value, expected_type)
    case expected_type
      when 'string', 'html', 'markdown' then value.is_a?(String)
      else true
    end
  end
end
