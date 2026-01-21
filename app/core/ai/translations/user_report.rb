# frozen_string_literal: true

module AI
  module Translations
    class UserReport < AsyncResponseRequest::AsyncRequestHandler
      def call
        params = context[:params]
        lang = params[:lang]
        texts_params = transform_params(params)
        hashsum = texts_params.hash
        cached_translations = find_cached_results(lang, hashsum)
        if cached_translations
          async_response.response_data = cached_translations
          return broadcast(:ok, async_response)
        end
        AI::TranslationAssistance.call!(
          user: current_user,
          texts: texts_params,
          options: { language: I18n.t("languages.#{lang}") }
        ) do
          on(:ok) do |result|
            result = transform_response(result)
            cache_results(lang, result, hashsum)
            async_response.response_data = result
          end
          on(:error) do |error_message|
            async_response.processing_status = :failed
            async_response.response_data = { error: { message: error_message } }
          end
        end

        broadcast(:ok, async_response)
      end

      private

      def transform_params(params)
        params[:texts].to_h.map do |key, value|
          { module_id: key, text: value.map { |k, v| { key: k, text: v } } }
        end
      end

      def transform_response(response)
        translations = response['translated_texts'].each_with_object({}) do |text, acc|
          acc[text['module_id']] ||= {}
          acc[text['module_id']].merge!(text['texts'].each_with_object({}) do |v, acc|
            acc[v['key']] = v['text']
            acc
          end)
          acc
        end

        { translations: translations, detected_lang: response['detected_language'] }
      end

      def find_cached_results(lang, hashsum)
        translations = AI::TranslationResult.find_by(translatable_type: 'UserReport', translatable_id: user_report_id)

        translations.results[lang] if translations && translations.results[lang] && translations.hashsum == hashsum
      end

      def cache_results(lang, result, hashsum)
        translations = AI::TranslationResult.find_or_initialize_by(
          translatable_type: 'UserReport', translatable_id: user_report_id, hashsum: hashsum
        )
        translations.results ||= {}
        translations.results[lang] = result
        translations.save!
      end

      def current_user
        context[:current_user]
      end

      def user_report_id
        context.dig(:meta, :user_report_id)
      end

      def plan
        current_user.active_user_idp_plan
      end

      def async_response
        @async_response ||= AsyncResponseRequest::AsyncResponse.new(
          async_request_uuid: context[:async_request_uuid],
          processing_status: :completed
        )
      end
    end
  end
end
