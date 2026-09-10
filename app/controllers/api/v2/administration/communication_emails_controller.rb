# frozen_string_literal: true

module Api
  class V2::Administration::CommunicationEmailsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    validate_crud_requests Api::V2::CommunicationEmail::Schema

    def preview
      locale = params.dig(:query, :locale) || I18n.default_locale
      rendered = Communications::Emails::RenderContent.call!(resource, locale: locale)
      render json: { subject: rendered.subject, body: rendered.body, rtl: rendered.rtl, from: from_address }
    end

    def retrigger
      email = resource

      audit! :retrigger, email, payload: { communication_email_id: email.id }

      result = Communications::Emails::Retrigger.call(email)

      if result[:ok]
        jsonapi_render json: email.reload
      else
        jsonapi_render_errors [{ detail: 'Email is not eligible for retrigger' }], status: :unprocessable_entity
      end
    end

    private

    def resource
      @resource ||= Api::Administration::CommunicationEmailPolicy::Scope.new(
        current_user, CommunicationEmail
      ).resolve.find(params[:id])
    end

    def from_address
      resource.project_campaign&.project&.smtp_setting&.from_name_and_email
    end
  end
end
