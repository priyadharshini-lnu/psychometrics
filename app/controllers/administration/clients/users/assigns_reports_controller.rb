module Administration
  module Clients
    module Users
      class AssignsReportsController < Administration::BaseController
        include Administration::Clients
        prepend_before_action :set_resource_class
        before_action :set_membership
        before_action :set_resource, only: %i[edit update]
        append_before_action :pundit_authorize

        def edit
        end

        def update
          resource.update!(resource_params)
        rescue ActiveRecord::RecordInvalid => e
          Rails.logger.error(e.message)
          render :edit
        end

        private

        def set_resource_class
          @_resource_class = AssignsReport
        end

        def set_membership
          @_membership = policy_scope(::Membership).join_user.includes(:client, :assigns).find(params[:user_id])
          @_client = membership.client
        end

        def resource_params
          params.require(:resource).permit(:user_access)
        end

        def pundit_authorize
          raise Pundit::NotAuthorizedError, 'Wrong Membership' unless policy(membership).overview_assigns?
          super
        end
      end
    end
  end
end
