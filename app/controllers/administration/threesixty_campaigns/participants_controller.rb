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
        participants = policy_scope(::Threesixty::Participant).
                       includes(:subject, :evaluator, :relationship).
                       actual_by_options(threesixty_campaign.option).
                       where.has { (campaign_id == sql_campaign_id) & ((subject_id == sql_user_id) | (evaluator_id == sql_user_id)) }
        user_results = UsersResult.where.
          has { (campaign_id == sql_campaign_id) & ((subject_id == sql_user_id) | (evaluator_id == sql_user_id)) }
        render json: participants, each_serializer: ::Threesixty::ParticipantSerializer, user_result_map: user_results.index_by { |r| [r.evaluator_id, r.subject_id] }
      end

      def update
        resource.update!(resource_params)
        respond_to do |format|
          format.html { redirect_to administration_threesixty_campaign_subject_evaluation_path(threesixty_campaign, resource.threesixty_subject, resource.evaluator_id) }
          format.json { render json: resource }
        end
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
        resource.destroy!
        render json: :ok
      end

      def resource_params
        params.require(:participant).permit(:relationship_id, :manager_nomination_status, :evaluator_nomination_status, :manager_evaluation_status)
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Participant
      end
    end
  end
end
