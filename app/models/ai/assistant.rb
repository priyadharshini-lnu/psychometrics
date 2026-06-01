# frozen_string_literal: true

class AI::Assistant < ApplicationRecord
  audited only: %i[name user_prompt system_prompt assistant_type model_id]

  include RansackSearchableFields
  include ::AI::RecalculatesArtifactDependenciesChecksum

  belongs_to :owner, class_name: 'Client', optional: true
  belongs_to :last_modified_by, class_name: 'User', optional: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  has_many :chats, class_name: 'AI::AssistantChat', foreign_key: 'ai_assistant_id', dependent: :destroy
  has_many :assistant_output_schema_keys,
           class_name: 'AI::AssistantOutputSchemaKey', foreign_key: 'ai_assistant_id', dependent: :destroy
  has_many :campaign_ai_artifacts, class_name: 'AI::CampaignArtifact', foreign_key: 'ai_assistant_id'
  has_many :assessment_assistants, foreign_key: :ai_assistant_id, dependent: :restrict_with_error
  has_many :assessments, through: :assessment_assistants

  accepts_nested_attributes_for :assistant_output_schema_keys, allow_destroy: true

  validates :model_id, presence: true
  validate :validate_type_specific_rules
  validate :prevent_assistant_type_change_when_in_use, if: :assistant_type_changed?

  before_destroy :check_ai_assistant_in_use

  enum :assistant_type, {
    content_writer: 0,
    idp_assistant: 1,
    assistant_tool: 2,
    development_actions_assistant: 3,
    writing_assistant: 4,
    translation_assistant: 5,
    content_analysis_assistant: 6
  }

  enum :status, {
    draft: 0,
    published: 1
  }

  ransacker :assistant_type, formatter: proc { |v| assistant_types[v] }

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[assistant_type model_id]
  end

  def for_user(user, options = {})
    chat = create_chat_for_user(user)
    configure_chat(chat, options)
    apply_system_prompt(chat, options[:contextual_information], options[:prompt_template_context])
    chat
  end

  # Returns the RubyLLM::Schema class for this assistant if configured
  delegate :output_schema_class, to: :type_configuration

  delegate :has_ruby_llm_schema?, to: :type_configuration

  def in_use?
    campaign_ai_artifacts.exists? || assessment_assistants.exists? || assigned_to_idp_template?
  end

  def provider_previously_used?
    actual_model = ai_provider_for_model&.dig('model')
    return false if actual_model.blank?

    last_used_model_id = chats.where.not(output_tokens: [nil, 0]).
                         joins(:ai_model_registry).
                         order(updated_at: :desc).
                         pick('ai_model_registries.model_id')

    last_used_model_id == actual_model
  end

  def assigned_to_idp_template?
    query = 'one_click_ai_assistant_id = ? OR document_analysis_ai_assistant_id = ? ' \
            'OR skill_gap_report_analysis_ai_assistant_id = ?'
    IdpTemplate.exists?([query, id, id, id])
  end

  def ai_provider_for_model
    return nil if Settings.ai_providers.blank?

    Settings.ai_providers.find { |provider| provider['model_id'] == model_id }
  end

  def configure_chat(chat, options)
    chat.to_llm.with_context(ruby_llm_context)

    chat.with_schema(output_schema_class) if output_schema_class

    chat.with_tools(*options[:tools], replace: true) if options[:tools].present?

    # Use provided params or fall back to default params for this type
    default_assistant_params = options[:skip_default_params] ? {} : default_params
    params_to_use = default_assistant_params.merge(options[:params] || {})
    chat.with_params(**params_to_use) if params_to_use.any?
    chat.with_headers(**ai_provider_for_model['headers']) if ai_provider_for_model['headers']
  end

  private

  def ruby_llm_context
    RubyLLM.context do |config|
      provider_config = ai_provider_for_model

      context = provider_config&.dig('context').to_h

      context.each do |key, value|
        config.send(:"#{key}=", value) if value.present? && config.respond_to?(:"#{key}=")
      end

      config.default_model = ai_provider_for_model['model']
    end
  end

  def create_chat_for_user(user)
    chats.create!(
      ai_assistant: self,
      user: user,
      model: ai_provider_for_model['model'],
      provider: ai_provider_for_model['custom_provider'].presence,
      assume_model_exists: ai_provider_for_model['custom_provider'].present? # Allow custom providers
    )
  end

  def apply_system_prompt(chat, contextual_information, prompt_template_context = {})
    parsed_instructions = build_system_prompt(contextual_information, prompt_template_context)
    chat.with_instructions(parsed_instructions.strip)
  end

  def default_params
    type_configuration.default_params
  end

  # Generate text-based schema context for system prompt
  def output_schema_as_context
    type_configuration.output_schema_as_context
  end

  def build_system_prompt(contextual_information = nil, prompt_template_context = {})
    rendered_prompt = render_system_prompt(prompt_template_context)

    <<~SYSTEM_PROMPT
      #{rendered_prompt}
      #{output_schema_as_context}
      #{contextual_information}
    SYSTEM_PROMPT
  end

  def render_system_prompt(prompt_template_context)
    return system_prompt unless advanced_prompting_enabled?

    AI::PromptTemplate::Renderer.call!(system_prompt, **prompt_template_context)
  end

  def validate_type_specific_rules
    validation_errors = type_configuration.validate_type_specific_rules

    validation_errors.each do |error|
      errors.add(error[:field], error[:message])
    end
  end

  # TODO: This should be replaced with published/draft status in future instead of not allowing deletion
  def check_ai_assistant_in_use
    return unless in_use?

    errors.add(:base, I18n.t('administration.ai_assistants.errors.cannot_delete_in_use', name: name))
    throw(:abort)
  end

  def prevent_assistant_type_change_when_in_use
    return unless in_use?

    errors.add(:assistant_type, I18n.t('admin.ai_assistants_cannot_change_type_when_in_use', name: name))
  end

  # Get the type-specific configuration instance
  def type_configuration
    @type_configuration ||= AI::AssistantTypeConfigurations::Factory.for(self)
  end
end
