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
                       where.has { (campaign_id == sql_campaign_id) & ((subject_id == sql_user_id) | (evaluator_id == sql_user_id)) }
        render json: participants, each_serializer: ParticipantSerializer
      end

      def update
        resource.update!(resource_params)
        render json: resource
      end

      def spoof
        user = User.find(params[:id])
        if user.is?(:superadmin, :project_admin)
          sign_in(user)
        else
          spoof_token = SecureRandom.urlsafe_base64(64)
          user.update_column(:spoof_token, spoof_token)
          redirect_url = root_url(domain: Settings.domain, subdomain: threesixty_campaign.project.try(:subdomain), spoof_token: spoof_token)
        end
        redirect_url ||= administration_root_path
        flash.now[:success] = t('.successfully', name: user.decorate.display_name)
        redirect_to redirect_url
      end

      def destroy
        ::Threesixty::Participants::Remove.call!(resource, threesixty_campaign.campaign)
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
