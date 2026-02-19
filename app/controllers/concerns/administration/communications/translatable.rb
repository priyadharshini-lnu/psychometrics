# frozen_string_literal: true

module Administration
  module Communications
    module Translatable
      extend ActiveSupport::Concern

      def update_translation
        locale = params[:locale] || I18n.default_locale

        form = ::Communications::TranslationForm.new(translation_params.merge(locale: locale)).
               with_context(communication: resource)

        if form.valid? && form.persist!
          audit! :update_translation, resource,
                 payload: { locale: locale, subject: params.dig(:communication, :subject),
                            body: params.dig(:communication, :body) }
          render json: { success: true,
                         message: t('administration.communications.update_translation.successfully_updated') }
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def edit_translation
        @communication = resource
        @selected_locale = params[:locale] || params[:lang] || I18n.default_locale.to_s

        @available_locales = I18n.available_locales.map(&:to_s).sort

        @reference_subject = @communication.subject
        @reference_body = @communication.body

        Mobility.with_locale(@selected_locale) do
          @translated_subject = @communication.subject
          @translated_body = @communication.body
        end

        respond_to do |format|
          if params[:locale].present?
            format.json do
              render json: {
                translated_subject: @translated_subject,
                translated_body: @translated_body,
                reference_subject: @reference_subject,
                reference_body: @reference_body,
                selected_locale: @selected_locale
              }
            end
          else
            format.js { render :edit_translation }
          end
        end
      end
    end
  end
end
