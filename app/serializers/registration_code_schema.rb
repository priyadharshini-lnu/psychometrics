# frozen_string_literal: true

class RegistrationCodeSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:code).filled(:str?)
      required(:name).filled(:str?)
      required(:total_count).filled(:int?)
      required(:use_count).filled(:int?)
      required(:start_date).filled(:str?)
      required(:end_date).filled(:str?)
      required(:disabled).filled(:bool?)
      required(:url).filled(:str?)
      required(:restricted_domains).maybe(:str?)
      required(:permissions).hash do
        required(:copy).maybe(:bool?)
        required(:download_qrcode).filled(:bool?)
        optional(:remove).maybe(:bool?)
        optional(:destroy).filled(:bool?)
        optional(:edit).filled(:bool?)
        optional(:update).filled(:bool?)
      end
    end
  end
end
