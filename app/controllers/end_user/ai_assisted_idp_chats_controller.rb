# frozen_string_literal: true

class EndUser::AIAssistedIdpChatsController < ApplicationController
  include AsyncRequestHandler

  before_action :load_active_user_idp_plan
  before_action :save_file, only: [:upload_document]

  async_request :ask, handler: AI::IdpChat::AskChat,
                  permit_params: ->(params) { params.permit(:message, :restart_chat) }

  async_request :upload_document, handler: AI::IdpChat::AnalyzeDocument,
                  permit_params: ->(params) {}

  async_request :reset, handler: AI::IdpChat::ResetChat,
                  permit_params: ->(params) {}

  def index
    if @active_user_idp_plan.ai_assisted_idp_session.present?
      return render json: EndUser::AIAssistedUserIdpSessionSerializer.new.serialize(
        @active_user_idp_plan.ai_assisted_idp_session
      )
    end

    new_session = AI::IdpChat::CreateNewChatSession.new(@active_user_idp_plan)

    new_session.on(:ok) do |session|
      render json: EndUser::AIAssistedUserIdpSessionSerializer.new.serialize(session)
    end.
      on(:error) do |error_message|
      render json: { errors: error_message }, status: :unprocessable_entity
    end.
      call
  end

  def meta_data
    file_name = @active_user_idp_plan.user_document.blob&.filename.to_s
    {
      file_name: file_name
    }
  end

  private

  def build_empty_session
    AI::IdpChat::CreateNewChatSession.call!(@active_user_idp_plan)
  end

  def load_active_user_idp_plan
    @active_user_idp_plan = current_user.active_user_idp_plan
  end

  def save_file
    @active_user_idp_plan.update(user_document: params[:file])
  end
end
