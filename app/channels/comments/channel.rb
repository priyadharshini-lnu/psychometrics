# frozen_string_literal: true

module Comments
  class Channel < ApplicationCable::Channel
    include Pundit
    include Administration::Policies

    def subscribed
      user_report = UserReport.find(params[:id])
      stream_for user_report
    end

    def pundit_user
      current_user
    end
  end
end
