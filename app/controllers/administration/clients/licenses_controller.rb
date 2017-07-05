module Administration
  module Clients
    class LicensesController < Administration::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource
      append_before_action :pundit_authorize

      def show
      end

      def edit
      end

      def update
        respond_to do |format|
          if resource.update(resource_params)
            format.js
          else
            format.js { render :edit }
          end
        end
      end

      private

      def set_resource_class
        @_resource_class ||= Client
      end

      def set_resource
        resource_id = client.root? ? client.id : client.root.id
        @_resource = policy_scope(resource_class).includes(licenses: [:report_family, :license_usages]).find(resource_id)
      end

      def resource_params
        params.require(:resource).permit(:id, licenses_attributes: [:id, :number, :overuse_number, :report_family_id,
                                                                    :start_date, :end_date, :_destroy])
      end

      def pundit_authorize
        authorize :license
      end
    end
  end
end
