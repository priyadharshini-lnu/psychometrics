# frozen_string_literal: true

module EndUser
  class AIAssistedUserIdpSessionSerializer < Panko::Serializer
    attributes :error, :messages, :meta, :checkpoint, :status

    def messages
      ai_assistant_chat = object.latest_chat
      return [] unless ai_assistant_chat

      messages = ai_assistant_chat.messages.
                 where(role: %w[user assistant]).
                 where.missing(:tool_calls).order(created_at: :asc).offset(1)

      Panko::ArraySerializer.new(messages, each_serializer: EndUser::IdpAIChatMessageSerializer).to_a
    end
  end
end
