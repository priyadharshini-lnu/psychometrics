# frozen_string_literal: true

class EndUser::AIAssistedIdpChatsController < ApplicationController
  include AsyncRequestHandler

  before_action :save_file, only: [:upload_document]

  async_request :ask, handler: AI::IdpChat::AskChat,
                  permit_params: ->(params) { params.permit(:message) }

  async_request :upload_document, handler: AI::IdpChat::AnalyzeDocument,
                  permit_params: ->(params) {}

  def index
    messages = current_user.active_user_idp_plan.ai_assisted_idp_session.
               ai_assistant_chat.messages.
               where(role: %w[user assistant]).
               where.missing(:tool_calls)

    render json: Panko::ArraySerializer.new(messages, each_serializer: EndUser::IdpAIChatMessageSerializer).to_a
  end

  def meta_data
    file_name = current_user.active_user_idp_plan.user_document.blob&.filename.to_s
    {
      file_name: file_name
    }
  end

  def save_file
    current_user.active_user_idp_plan.update(user_document: params[:file])
  end
end
