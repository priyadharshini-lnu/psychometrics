# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class ParticipantsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        query = params[:q] ? JSON.parse(params[:q]) : {}
        participants = policy_scope(::Participant).where(campaign_id: threesixty_campaign.campaign_id).ransack(query).result
        subject_map = policy_scope(::Threesixty::Subject).where(campaign_id: threesixty_campaign.campaign_id).index_by(&:user_id)
        render json: participants.map { |p| ::Threesixty::ParticipantSerializer.new(p, subject_map: subject_map).to_h }
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Participant
      end
    end
  end
end
