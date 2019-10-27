# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class UsersController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource
      # append_before_action :pundit_authorize

      def update
        if form.valid?
          resource.update!(form.attributes)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      private

      def set_resource_class
        @_resource_class ||= User # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def form
        @form ||= if current_user.superadmin?
                    ::Users::SuperAdminEditForm
                  else
                    ::Users::AdminEditForm
                  end.from_params(params[:user])
      end
    end
  end
end
