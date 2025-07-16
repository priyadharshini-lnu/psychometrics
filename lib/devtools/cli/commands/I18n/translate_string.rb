# frozen_string_literal: true

require 'deepl'
require 'net/http'
require 'json'
require 'uri'

module Devtools
  module CLI
    module Commands
      module I18n
        class TranslateString < Base
          desc <<~DESC
            This command translates a given string from English to a target language using DeepL or Microsoft Translator API.

            The command preserves interpolation variables like %<name>s during translation.

            For DeepL translation, set the DEEPL_AUTH_KEY environment variable.
            For Microsoft Translator, set MICROSOFT_TRANSLATION_API_KEY and MICROSOFT_TRANSLATION_API_REGION environment variables.
          DESC

          option :string,
                 desc: 'String to translate',
                 required: true,
                 alias: :s

          option :target_language,
                 desc: 'Target language code (e.g., es, fr, de)',
                 required: true,
                 alias: :t

          option :source_language,
                 desc: 'Source language code (default: en)',
                 default: 'en',
                 alias: :sl

          option :preserve_formatting,
                 desc: 'Preserve formatting during translation',
                 type: :boolean,
                 default: true

          option :translation_provider,
                 desc: 'Translation provider (deepl or microsoft)',
                 default: 'deepl',
                 alias: :p

          option :no_log,
                 desc: 'Suppress all output except errors',
                 type: :boolean,
                 default: false

          # Mapping of locale codes to DeepL target language codes
          DEEPL_LOCALE_MAPPING = {
            'ar' => 'AR',
            'bg' => 'BG',
            'cs' => 'CS',
            'da' => 'DA',
            'de' => 'DE',
            'el' => 'EL',
            'en' => 'EN',
            'en-gb' => 'EN-GB',
            'en-us' => 'EN-US',
            'es' => 'ES',
            'et' => 'ET',
            'fi' => 'FI',
            'fr' => 'FR',
            'he' => 'HE',
            'hu' => 'HU',
            'id' => 'ID',
            'it' => 'IT',
            'ja' => 'JA',
            'ko' => 'KO',
            'lt' => 'LT',
            'lv' => 'LV',
            'nb' => 'NB',
            'nl' => 'NL',
            'pl' => 'PL',
            'pt' => 'PT',
            'pt-br' => 'PT-BR',
            'pt-pt' => 'PT-PT',
            'ro' => 'RO',
            'ru' => 'RU',
            'sk' => 'SK',
            'sl' => 'SL',
            'sv' => 'SV',
            'th' => 'TH',
            'tr' => 'TR',
            'uk' => 'UK',
            'vi' => 'VI',
            'zh' => 'ZH',
            'zh-hans' => 'ZH-HANS',
            'zh-hant' => 'ZH-HANT',
            'hr' => 'HR',
            'sr' => 'SR'
          }.freeze

          # Mapping of locale codes to Microsoft Translator language codes
          MICROSOFT_LOCALE_MAPPING = {
            'ar' => 'ar',
            'bg' => 'bg',
            'cs' => 'cs',
            'da' => 'da',
            'de' => 'de',
            'el' => 'el',
            'en' => 'en',
            'en-gb' => 'en',
            'en-us' => 'en',
            'es' => 'es',
            'et' => 'et',
            'fi' => 'fi',
            'fr' => 'fr',
            'he' => 'he',
            'hu' => 'hu',
            'id' => 'id',
            'it' => 'it',
            'ja' => 'ja',
            'ko' => 'ko',
            'lt' => 'lt',
            'lv' => 'lv',
            'nb' => 'nb',
            'nl' => 'nl',
            'pl' => 'pl',
            'pt' => 'pt',
            'pt-br' => 'pt',
            'pt-pt' => 'pt',
            'ro' => 'ro',
            'ru' => 'ru',
            'sk' => 'sk',
            'sl' => 'sl',
            'sv' => 'sv',
            'th' => 'th',
            'tr' => 'tr',
            'uk' => 'uk',
            'vi' => 'vi',
            'zh' => 'zh',
            'zh-hans' => 'zh-Hans',
            'zh-hant' => 'zh-Hant',
            'hr' => 'hr',
            'sr-Latn' => 'sr-Latn'
          }.freeze

          def call(string:, target_language:, **options)
            @string = string
            @target_language = target_language.downcase
            @source_language = (options[:source_language] || 'en').upcase
            @preserve_formatting = options.fetch(:preserve_formatting, true)
            @provider = (options[:translation_provider] || 'deepl').downcase
            @no_log = options.fetch(:no_log, false)

            validate_inputs
            perform_translation
          end

          def validate_inputs
            validate_api_keys
            validate_languages
            validate_string
            validate_provider
          end

          def validate_api_keys
            case @provider
              when 'deepl'
                validate_deepl_auth_key
              when 'microsoft'
                validate_microsoft_auth_keys
              else
                cli_error "Unsupported provider '#{@provider}'. Supported providers: deepl, microsoft"
            end
          end

          def validate_deepl_auth_key
            if ENV['DEEPL_AUTH_KEY'].nil? || ENV['DEEPL_AUTH_KEY'].strip.empty?
              cli_error 'DEEPL_AUTH_KEY environment variable is not set. DeepL translation requires an API key.'
            end
          end

          def validate_microsoft_auth_keys
            if ENV['MICROSOFT_TRANSLATION_API_KEY'].nil? || ENV['MICROSOFT_TRANSLATION_API_KEY'].strip.empty?
              cli_error 'MICROSOFT_TRANSLATION_API_KEY environment variable is not set. ' \
                        'Microsoft Translator requires an API key.'
            end

            if ENV['MICROSOFT_TRANSLATION_API_REGION'].nil? || ENV['MICROSOFT_TRANSLATION_API_REGION'].strip.empty?
              cli_error 'MICROSOFT_TRANSLATION_API_REGION environment variable is not set. ' \
                        'Microsoft Translator requires a region.'
            end
          end

          def validate_provider
            unless %w[deepl microsoft].include?(@provider)
              cli_error "Unsupported provider '#{@provider}'. Supported providers: deepl, microsoft"
            end
          end

          def validate_languages
            mapping = @provider == 'deepl' ? DEEPL_LOCALE_MAPPING : MICROSOFT_LOCALE_MAPPING

            unless mapping.key?(@target_language)
              cli_error "Unsupported target language '#{@target_language}' for #{@provider}. " \
                        "Supported languages: #{mapping.keys.reject { |code| code.start_with?('en') }.sort.join(', ')}"
            end

            unless @source_language == 'EN'
              cli_error 'Currently only English (EN) is supported as source language.'
            end
          end

          def validate_string
            if @string.nil? || @string.strip.empty?
              cli_error 'String cannot be empty.'
            end
          end

          def perform_translation
            cli_log "Translating: '#{@string}'" unless @no_log

            target_code = case @provider
                            when 'deepl'
                              DEEPL_LOCALE_MAPPING[@target_language]
                            when 'microsoft'
                              MICROSOFT_LOCALE_MAPPING[@target_language]
                          end

            cli_log "From: #{@source_language} to #{target_code} using #{@provider.capitalize}" unless @no_log

            begin
              translated_text = case @provider
                                  when 'deepl'
                                    translate_with_deepl(@string, @target_language)
                                  when 'microsoft'
                                    translate_with_microsoft(@string, @target_language)
                                end

              if translated_text
                cli_log "Translation: '#{translated_text}'" unless @no_log
                puts translated_text # Output for use in other scripts
                translated_text # Return the translated text for programmatic use
              else
                cli_error 'Translation failed.'
                nil
              end
            rescue StandardError => e
              cli_error "Translation error: #{e.message}"
              nil
            end
          end

          def translate_with_deepl(text, target_locale)
            # Map locale codes to DeepL supported codes
            deepl_locale = DEEPL_LOCALE_MAPPING[target_locale]
            return nil unless deepl_locale

            begin
              # Protect interpolation variables
              protected_text = protect_interpolation_variables(text)

              # Use DeepL gem with tag handling
              translation = DeepL.translate(
                protected_text,
                @source_language,
                deepl_locale,
                tag_handling: 'xml',
                ignore_tags: ['x'],
                preserve_formatting: @preserve_formatting
              )

              # Restore interpolation variables
              restore_interpolation_variables(translation.text) if translation
            rescue StandardError => e
              cli_error "DeepL translation error: #{e.message}"
            end
          end

          def translate_with_microsoft(text, target_locale)
            # Map locale codes to Microsoft supported codes
            microsoft_locale = MICROSOFT_LOCALE_MAPPING[target_locale]
            return nil unless microsoft_locale

            begin
              # Protect interpolation variables for Microsoft API
              protected_text = protect_interpolation_variables_microsoft(text)

              uri = URI('https://api.cognitive.microsofttranslator.com/translate')
              uri.query = URI.encode_www_form({
                'api-version' => '3.0',
                'to' => microsoft_locale
              })

              http = Net::HTTP.new(uri.host, uri.port)
              http.use_ssl = true

              request = Net::HTTP::Post.new(uri)
              request['Ocp-Apim-Subscription-Key'] = ENV.fetch('MICROSOFT_TRANSLATION_API_KEY', nil)
              request['Ocp-Apim-Subscription-Region'] = ENV.fetch('MICROSOFT_TRANSLATION_API_REGION', nil)
              request['Content-Type'] = 'application/json'
              request.body = [{ text: protected_text }].to_json

              response = http.request(request)

              if response.code == '200'
                result = JSON.parse(response.body)
                translated_text = result[0]['translations'][0]['text']
                # Restore interpolation variables
                restore_interpolation_variables_microsoft(translated_text)
              else
                cli_error "Microsoft Translator API error: #{response.code} - #{response.body}"
                nil
              end
            rescue StandardError => e
              cli_error "Microsoft Translator error: #{e.message}"
              nil
            end
          end

          def protect_interpolation_variables(text)
            # Replace %{variable} with <x>%{variable}</x> for each variable
            text.gsub(/%\{[^}]+\}/) do |match|
              "<x>#{match}</x>"
            end
          end

          def restore_interpolation_variables(text)
            # Remove the <x> and </x> tags while keeping the %{variable} intact
            text.gsub(/<x>(%\{[^}]+\})<\/x>/, '\1') # rubocop:disable Style/RegexpLiteral
          end

          def protect_interpolation_variables_microsoft(text)
            # Replace %{variable} with unique placeholder that won't be translated
            placeholders = {}
            counter = 0

            protected_text = text.gsub(/%\{[^}]+\}/) do |match|
              placeholder = "INTERPOLATION_VAR_#{counter}"
              placeholders[placeholder] = match
              counter += 1
              placeholder
            end

            @interpolation_placeholders = placeholders
            protected_text
          end

          def restore_interpolation_variables_microsoft(text)
            # Restore the original interpolation variables
            return text unless @interpolation_placeholders

            restored_text = text
            @interpolation_placeholders.each do |placeholder, original|
              restored_text = restored_text.gsub(placeholder, original)
            end

            @interpolation_placeholders = nil
            restored_text
          end
        end
      end
    end
  end
end
