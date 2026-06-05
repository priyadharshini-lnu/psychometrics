# frozen_string_literal: true

class AI::CampaignArtifact < ApplicationRecord
  self.table_name = 'campaign_ai_artifacts'

  MAX_CAMPAIGN_AI_ARTIFACTS = 50

  after_save :recalculate_dependencies_checksum!, if: :dependency_attributes_changed?

  belongs_to :ai_assistant, class_name: 'AI::Assistant'
  belongs_to :campaign
  include Tenantable

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

  scope :filterable_fields, lambda { |search_term|
    search_term = search_term.to_s

    where(
      "#{table_name}.id::text ILIKE :q OR #{table_name}.name ILIKE :q OR #{table_name}.code ILIKE :q",
      q: "%#{search_term}%"
    )
  }

  def validate_results_schema(results)
    errors = []

    validate_results_keys(results, errors)
    validate_results_types(results, errors)

    errors
  end

  def self.ransackable_scopes(_)
    %i[filterable_fields]
  end

  def recalculate_dependencies_checksum!
    update_column(:dependencies_checksum, generate_dependencies_checksum)
  end

  private

  def dependency_attributes_changed?
    saved_change_to_instructions? ||
      saved_change_to_ai_assistant_id?
  end

  def generate_dependencies_checksum
    assistant_id = ai_assistant_id.to_s
    assistant_model = ai_assistant.model_id.to_s
    assistant_dependencies = ai_assistant.dependencies.sort.join('; ')
    campaign_instructions = instructions.to_s

    deps = dependencies.order(:dependency_type, :dependency_id).map do |dep|
      [dep.dependency_type, dep.dependency_id].join('; ')
    end.join('|')

    system_prompt = ai_assistant.system_prompt.to_s
    user_prompt = ai_assistant.user_prompt.to_s

    schema_keys = assistant_output_schema_keys.order(:key).map do |osk|
      [osk.key, osk.key_type, osk.description].join('; ')
    end.join('|')

    raw_string = [assistant_id, assistant_model, assistant_dependencies,
                  campaign_instructions, deps, system_prompt, user_prompt,
                  schema_keys].join('||')

    Digest::MD5.hexdigest(raw_string)
  end

  def validate_results_keys(results, errors)
    expected_keys = assistant_output_schema_keys.pluck(:key).map(&:to_s)
    actual_keys = (results || {}).stringify_keys.keys

    missing_keys = expected_keys - actual_keys
    extra_keys = actual_keys - expected_keys

    if missing_keys.any?
      # Translations are not required as it will be consumed by LLMs
      errors << "is missing required keys: #{missing_keys.map { |key| "'#{key}'" }.join(', ')}"
    end

    if extra_keys.any?
      # Translations are not required as it will be consumed by LLMs
      errors << "contains unexpected keys: #{extra_keys.map { |key| "'#{key}'" }.join(', ')}"
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
