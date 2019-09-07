# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EvaluationsController < Administration::ThreesixtyCampaigns::BaseController
      include AuthenticateByToken

      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show]
      append_before_action :pundit_authorize

      def show
        @users_result = UsersResult.find_by!(campaign_id: threesixty_campaign.campaign_id,
                                            subject_id: resource.user_id,
                                            evaluator_id: params[:id])
        @participant = threesixty_campaign.participants.find_by!(subject_id: resource.user_id,
                                            evaluator_id: params[:id])
        @users_result.step = 0
        @results = UsersResultSerializer.new(@users_result, participant: @participant, campaign: threesixty_campaign,
                 current_user: current_user, include: '**').to_json

        piped_text_context = {
          evaluator: @users_result.evaluator,
          subject: @users_result.subject,
          threesixty_campaign: threesixty_campaign
        }
        @assessment = ::AssessmentSerializer.new(threesixty_campaign.assessment, piped_text_context: piped_text_context).to_hash(include: '**')
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Subject
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:subject_id])
      end

      def pundit_authorize
        authorize [:threesixty, :participant]
      end
    end
  end
end
