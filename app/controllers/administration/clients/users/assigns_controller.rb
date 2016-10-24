module Administration
  module Clients
    module Users
      class AssignsController < Administration::ReportsController
        prepend_before_action :set_user
        prepend_before_action :set_client

        def index
          @filter_form = Assign.where(user_id: @user.id, client_id: @client.id).includes(:assessment).search(params[:q])
          @resources = @filter_form.result
        end

        private

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
          add_breadcrumb @client.decorate.display_name, '#'
          add_breadcrumb I18n.t('administration.breadcrumbs.reports'), {action: :index}
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
