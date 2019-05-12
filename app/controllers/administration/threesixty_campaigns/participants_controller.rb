# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class ParticipantsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update destroy]
      append_before_action :pundit_authorize

      def index
        sql_campaign_id = threesixty_campaign.campaign_id
        sql_user_id = params[:user_id]
        participants = policy_scope(::Participant).
                     includes(:subject, :evaluator, :relationship).
                     where.
                     has { (campaign_id == sql_campaign_id) & ((subject_id == sql_user_id) | (evaluator_id == sql_user_id)) }.
                     map do |p|
          ::ParticipantSerializer.new(p).to_h
        end
        render json: participants
      end

      def update
        resource.update!(resource_params)
        render json: resource
      end

      def destroy
        evaluator = ::Threesixty::Evaluator.find_by!(user_id: resource.evaluator_id, campaign: threesixty_campaign.campaign)
        subject = ::Threesixty::Subject.find_by!(user_id: resource.subject_id, campaign: threesixty_campaign.campaign)

        resource.destroy!
        evaluator.decrement!(:evaluations_count)
        subject.decrement!(:evaluators_count)
        render json: :ok
      end

      def resource_params
        params.require(:participant).permit(:relationship_id, :manager_status, :evaluator_status)
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Participant
      end
    end
  end
end
