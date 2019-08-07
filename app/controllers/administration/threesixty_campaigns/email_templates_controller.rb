# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EmailTemplatesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[update send_test_email]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        render json: threesixty_campaign.email_templates.order(:id)
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

      def send_test_email
        form = ::Threesixty::EmailTemplateTestMailForm.from_params(params)
        if form.valid?
          ::Threesixty::EmailTemplateMailer.test_email(resource, params[:to_email]).deliver_later
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
