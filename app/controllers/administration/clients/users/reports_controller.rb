module Administration
  module Clients
    module Users
      class ReportsController < Administration::ReportsController
        prepend_before_action :set_resource_class
        prepend_before_action :set_user
        prepend_before_action :set_client
        append_before_action :pundit_authorize

        def show
          # TODO: add to pundit, but this is problem :)
          raise Pundit::NotAuthorizedError.new unless @resource.assessment.psychometric?
          @results = Assign.completed.where(client_id: @client.id, assessment_id: @resource.assessment_id).all
          render layout: 'empty'
        end

        private

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, @client, :users]
          add_breadcrumb @client.decorate.display_name, '#'
          add_breadcrumb @user.decorate.display_name, '#'
          add_breadcrumb I18n.t('administration.breadcrumbs.reports'), '#'
          add_breadcrumb @resource.name, {action: :index}
        end

        def set_user
          @user = policy_scope(User).find(params[:user_id])
        end

        def set_client
          @client = policy_scope(Client).find(params[:client_id])
        end
      end
    end
  end
end
