# frozen_string_literal: true

module EndUser
  class SystemChecksSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:url).filled(:str?)
        required(:campaign_id).maybe(:int?)
        required(:transcribe_supported_locales).maybe(:array?).each(:str?)
        required(:checks).hash do
          required(:video).filled(:bool?)
          required(:audio).filled(:bool?)
          required(:network).filled(:bool?)
        end
        required(:config).hash do
          required(:network).hash do
            required(:upload).filled(:int?)
            required(:download).filled(:int?)
          end
          required(:speed_of_me_api_token).filled(:str?)
        end
      end
    end
  end
end
