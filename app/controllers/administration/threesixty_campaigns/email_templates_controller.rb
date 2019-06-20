# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EmailTemplatesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[update]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        render json: threesixty_campaign.email_templates
      end

      def update
        form = ::Threesixty::EmailTemplateForm.from_params(params[:email_template])
        if form.valid?
          resource.update!(form.attributes)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailTemplate
      end
    end
  end
end
