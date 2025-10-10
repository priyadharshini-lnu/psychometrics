# frozen_string_literal: true

module EndUser
  class AIAssistedUserSessionSerializer < Panko::Serializer
    attributes :error, :messages, :meta, :checkpoint, :status

    def messages
      ai_assistant_chat = object.ai_assistant_chat
      return [] unless ai_assistant_chat

      messages = ai_assistant_chat.messages.
                 where(role: %w[user assistant]).
                 where.missing(:tool_calls).order(created_at: :asc)

      Panko::ArraySerializer.new(messages, each_serializer: EndUser::IdpAIChatMessageSerializer).to_a
    end
  end
end
