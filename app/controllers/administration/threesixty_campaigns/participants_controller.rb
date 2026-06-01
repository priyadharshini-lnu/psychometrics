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
                       where(campaign_id: sql_campaign_id).
                       where('user_assessments.subject_id = :user_id OR user_assessments.evaluator_id = :user_id',
                             user_id: sql_user_id).
                       includes(:users_result)

        render json: Panko::ArraySerializer.new(
          participants,
          each_serializer: ::Threesixty::ParticipantSerializer
        ).to_a
      end

      def update
        resource.update!(resource_params)
        send_nomination_denied_email(resource) if resource_params[:manager_nomination_status] == 'denied'
        audit! :update, resource, payload: resource_params, campaign: threesixty_campaign.campaign

        respond_to do |format|
          format.html do
            redirect_to administration_threesixty_campaign_subject_evaluation_path(threesixty_campaign,
                                                                                   resource.threesixty_subject,
                                                                                   resource.evaluator_id)
          end
          format.json { render json: ::Threesixty::ParticipantSerializer.new.serialize(resource) }
        end
      end

      def spoof
        user = User.find(params[:id])
        audit! :sign_in_as, user, payload: { sign_in_as: user.email }
        if user.is?(:superadmin, :project_admin)
          siem_log_impersonation_event(user, 'Admin')
          impersonate_as_admin(user)
        else
          spoof_token = impersonate_as_end_user(user)
          siem_log_impersonation_event(user, 'End User')
          redirect_url = root_url(
            domain: Settings.domain,
            subdomain: threesixty_campaign.project.try(:subdomain),
            spoof_token: spoof_token
          )
        end
        redirect_url ||= admin_path
        # flash.now[:success] = t('.successfully', name: user.decorate.display_name)
        redirect_to redirect_url, allow_other_host: true
      end

      def destroy
        audit! :delete, resource, payload: resource.log_attribute_for_delete
        resource.destroy!
        render json: :ok
      end

      def resource_params
        params.expect(participant: %i[relationship_id manager_nomination_status
                                      evaluator_nomination_status manager_evaluation_status])
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Participant # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def send_nomination_denied_email(participant)
        ::Threesixty::Emails::Send.call!(
          ::Threesixty::Emails::Name::NOMINATION_DENIED,
          threesixty_campaign: threesixty_campaign,
          subject: participant.threesixty_subject,
          evaluator: participant.threesixty_evaluator
        )
      end
    end
  end
end
