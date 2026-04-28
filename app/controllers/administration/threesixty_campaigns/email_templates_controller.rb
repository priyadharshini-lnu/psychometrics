# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EmailTemplatesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update send_test_email]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        render json: threesixty_campaign.email_templates.order(:id)
      end

      def show
        list = params[:locales].map do |locale|
          Mobility.with_locale(locale) do
            ::Threesixty::EmailTemplateLocaleSerializer.new(context: { locale: locale }).serialize(resource)
          end
        end
        render json: { list: list, available_locales: resource.translations.map(&:locale) }
      end

      def update
        form = ::Threesixty::EmailTemplateForm.from_params(params[:email_template]).
               with_context(email_template: resource)
        if form.valid?
          audit! :update_email_template, resource, payload: form.attributes, campaign: threesixty_campaign.campaign
          Mobility.with_locale(params[:locale]) do
            resource.update!(form.attributes)
          end
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def send_test_email
        form = ::EmailTest::Form.from_params(params)
        if form.valid?
          ::Threesixty::EmailTemplateMailer.test_email(resource, form.to_email).deliver_later
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailTemplate # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
