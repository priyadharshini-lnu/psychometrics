# frozen_string_literal: true

class AI::AssistantChat < ApplicationRecord
  self.table_name = 'ai_assistant_chats'
  acts_as_chat messages: :messages, message_class: 'AI::AssistantRequest', model: :ai_model_registry, model_class: 'AI::ModelRegistry'

  belongs_to :ai_assistant, class_name: 'AI::Assistant'
  belongs_to :ai_assisted_user_session, class_name: 'AI::AssistedUserSession', optional: true
  belongs_to :user, class_name: 'User'

  has_many :messages,
           -> { order(created_at: :asc) },
           class_name: 'AI::AssistantRequest',
           foreign_key: 'ai_assistant_chat_id',
           dependent: :destroy

  # Override the ask method to support custom service
  # This is required till https://github.com/crmne/ruby_llm/pull/325 is merged and released
  def ask(message, with: nil, service: nil, persist_attachment: false, &)
    if service == :openai_response_api
      ask_with_response_api(message, with: with, persist_attachment: persist_attachment, &)
    else
      super(message, with: with, &)
    end
  end

  def with_assistant_context(options = {})
    self.assume_model_exists = provider_config['custom_provider'].present?

    to_llm.with_context(ai_assistant.ruby_llm_context)

    if ai_assistant.has_ruby_llm_schema?
      with_schema(ai_assistant.output_schema_class)
    end

    if options[:tools]
      with_tools(*options[:tools], replace: true)
    end

    if options[:params]
      with_params(**options[:params])
    end

    self
  end

  # Overriding to_llm to set assume_model_exists flag
  # Original at lib/ruby_llm/active_record/chat_methods.rb#78
  def to_llm
    model_record = model_association
    @chat ||= (context || RubyLLM).chat(
      model: model_record.model_id,
      provider: model_record.provider.to_sym,
      assume_model_exists: assume_model_exists || false
    )
    @chat.reset_messages!

    messages_association.each do |msg|
      @chat.add_message(msg.to_llm)
    end

    setup_persistence_callbacks
  end

  private

  def provider_config
    @provider_config ||= ai_assistant.ai_provider_for_model
  end

  def ask_with_response_api(message, with: nil, persist_attachment: false, &)
    # Create LLM chat object first (more efficient)
    # When an attachment is already added to message record `chat.to_llm` method downloads it again making it slower
    # In most cases we don't need to download or attach it again to AI::AssistantRequest record
    llm_chat = to_llm

    # Add message to LLM chat without persisting to DB yet
    content = RubyLLM::Content.new(message, with)
    llm_chat.add_message(role: :user, content: content)

    # Use the custom service
    complete_with_response_api(llm_chat, message, with, persist_attachment, &)
  end

  def complete_with_response_api(llm_chat, original_message, attachment_url, persist_attachment, &block)
    response_message = AI::Services::OpenaiResponseApi.call!(llm_chat)

    # Persist both user and assistant messages
    create_user_message(original_message, with: persist_attachment ? attachment_url : nil)
    persist_response_message(response_message)

    block&.call(response_message)

    response_message
  rescue StandardError => e
    # Error: still persist user message for audit trail, but no blob unless explicitly requested
    create_user_message(original_message, with: persist_attachment ? attachment_url : nil)
    raise e
  end

  def persist_response_message(llm_message)
    messages.create!(
      llm_message.to_h.slice(:role, :content, :input_tokens, :output_tokens)
    )
  end
end
