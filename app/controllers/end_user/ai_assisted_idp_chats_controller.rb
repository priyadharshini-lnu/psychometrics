# frozen_string_literal: true

class EndUser::AIAssistedIdpChatsController < ApplicationController
  include AsyncRequestHandler

  before_action :save_file, only: [:upload_document]

  async_request :ask, handler: AI::IdpChat::AskChat,
                  permit_params: ->(params) { params.permit(:message) }

  async_request :upload_document, handler: AI::IdpChat::AnalyzeDocument,
                  permit_params: ->(params) { params.permit(:message) }

  def index
    # response with chat user session messages
    render json: {
      messages: [
        { role: 'system', type: 'Welcome', message: 'Welcome to the AI-assisted chat! How can I help you today?' }
      ]
    }
  end

  def save_file
    # safe file to user_idp_plan before call async request
  end
end
