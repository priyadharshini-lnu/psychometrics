# frozen_string_literal: true

class AI::Assistant < ApplicationRecord
  audited

  belongs_to :owner, class_name: 'Client', optional: true
  belongs_to :last_modified_by, class_name: 'User', optional: true
  has_many :chats, class_name: 'AI::AssistantChat', foreign_key: 'ai_assistant_id', dependent: :destroy

  validates :model_id, presence: true

  def for_user(user)
    chat = chats.create!(ai_assistant: self, user: user, model_id: model_id)
    chat.with_instructions(system_prompt)
    chat.with_context(ruby_llm_context)
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

  def ai_provider_for_model
    return nil if Settings.ai_providers.blank?

    Settings.ai_providers.find { |provider| provider['model_id'] == model_id }
  end
end
