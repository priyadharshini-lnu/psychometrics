# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EvaluationsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update destroy]
      append_before_action :pundit_authorize
      before_action :init_breadcrumbs, except: %i[update destroy]

      def show
        @users_result = UsersResult.find_by!(campaign_id: threesixty_campaign.campaign_id,
                                             subject_id: resource.user_id,
                                             evaluator_id: params[:id])
        @participant = threesixty_campaign.participants.find_by!(subject_id: resource.user_id,
                                            evaluator_id: params[:id])
        @users_result.step = 0
        @results = UsersResultSerializer.new(@users_result, participant: @participant, campaign: threesixty_campaign,
                                             current_user: current_user, include: '**')

        piped_text_context = {
          evaluator: @users_result.evaluator,
          subject: @users_result.subject,
          threesixty_campaign: threesixty_campaign
        }

        @assessment = ::AssessmentSerializer.new(threesixty_campaign.assessment, piped_text_context: piped_text_context).to_hash(include: '**')
      end

      def update
        @users_result = UsersResult.find_by!(campaign_id: threesixty_campaign.campaign_id,
                                             subject_id: resource.user_id,
                                             evaluator_id: params[:id])
        form = ::UsersResults::UpdatingForm.from_params(params.require(:resource))
        ::UsersResults::UpdateUsersResult.call(form, @users_result, threesixty_campaign)

        head :no_content
      end

      def destroy
        users_result = UsersResult.find_by!(campaign_id: threesixty_campaign.campaign_id,
                                             subject_id: resource.user_id,
                                             evaluator_id: params[:id])
        users_result.destroy!
        render json: {id: users_result.id}
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

      def init_breadcrumbs
        client = resource.campaign.client
        project = resource.campaign.project
        label = t('administration.breadcrumbs.clients') if current_user.is?(:superadmin)
        label ||= t('administration.breadcrumbs.home')
        add_breadcrumb label, [:administration, :root]
        add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
        add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
        add_breadcrumb(
          t('administration.clients.projects.threesixty_campaigns.index.title'),
          administration_client_project_threesixty_campaigns_path(client, project)
        )
        add_breadcrumb resource.campaign.name, administration_client_project_threesixty_campaign_path(client, project, threesixty_campaign) if params[:action] == 'show'
      end
    end
  end
end
