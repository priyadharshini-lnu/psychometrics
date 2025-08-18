# frozen_string_literal: true

class AI::Assistant < ApplicationRecord
  audited

  ALLOWED_DEPENDENCIES = %w[datasheet assessments campaign_factors].freeze

  include RansackSearchableFields

  self.inheritance_column = :_type_disabled

  belongs_to :owner, class_name: 'Client', optional: true
  belongs_to :last_modified_by, class_name: 'User', optional: true
  has_many :chats, class_name: 'AI::AssistantChat', foreign_key: 'ai_assistant_id', dependent: :destroy
  has_many :assistant_output_schema_keys,
           class_name: 'AI::AssistantOutputSchemaKey', foreign_key: 'ai_assistant_id', dependent: :destroy
  has_many :campaign_ai_artifacts, class_name: 'AI::CampaignArtifact', foreign_key: 'ai_assistant_id'

  accepts_nested_attributes_for :assistant_output_schema_keys, allow_destroy: true

  validates :model_id, presence: true
  validate :dependencies_must_be_valid

  before_destroy :check_ai_assistant_in_use

  enum :assistant_type, {
    content_writer: 0
  }

  enum :status, {
    draft: 0,
    published: 1
  }

  ransacker :assistant_type, formatter: proc { |v| assistant_types[v] }

  def for_user(user)
    chat = chats.create!(ai_assistant: self, user: user, model_id: model_id)
    chat.with_instructions(parsed_system_prompt.strip)
    chat.with_context(ruby_llm_context)
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[assistant_type]
  end

  private

  def ruby_llm_context
    RubyLLM.context do |config|
      provider_config = ai_provider_for_model

      context = provider_config&.dig('context').to_h

      context.each do |key, value|
        config.send(:"#{key}=", value) if value.present? && config.respond_to?(:"#{key}=")
      end

      config.default_model = model_id
    end
  end

  def output_schema_as_context
    return '' if assistant_output_schema_keys.blank?

    context_lines = ['Following is the assistant schema:']
    context_lines << '<assistant_output_schema>'
    assistant_output_schema_keys.each do |osk|
      context_lines << "- **#{osk.key}** (#{osk.key_type}): #{osk.description}"
    end
    context_lines << '</assistant_output_schema>'
    context_lines.join("\n")
  end

  def parsed_system_prompt
    <<~SYSTEM_PROMPT
      #{system_prompt}
      #{output_schema_as_context}
    SYSTEM_PROMPT
  end

  def ai_provider_for_model
    return nil if Settings.ai_providers.blank?

    Settings.ai_providers.find { |provider| provider['model_id'] == model_id }
  end

  def dependencies_must_be_valid
    if dependencies.nil?
      errors.add(:dependencies, 'must be present')
      return
    end

    unless dependencies.is_a?(Array)
      errors.add(:dependencies, 'must be an array')
      return
    end

    invalid = dependencies - ALLOWED_DEPENDENCIES
    unless invalid.empty?
      errors.add(:dependencies, "contains invalid entry(ies): #{invalid.join(', ')}")
    end
  end

  # TODO: This should be replaced with published/draft status in future instead of not allowing deletion
  def check_ai_assistant_in_use
    return unless campaign_ai_artifacts.exists?

    errors.add(:base, I18n.t('administration.ai_assistants.errors.cannot_delete_in_use', name: name))
    throw(:abort)
  end
end
