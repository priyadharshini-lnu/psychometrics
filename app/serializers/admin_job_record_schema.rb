# frozen_string_literal: true

class AdminJobRecordSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:operation).filled(:str?)
      required(:progress).filled(:int?)
      required(:data).maybe(:hash?)
      required(:status).filled(:str?)
      required(:error_messages).maybe(:array?)
      required(:content).maybe(:str?)
      required(:read).filled(:bool?)
      required(:created_at).filled(:str?)
      required(:is_valid).filled(:bool?)
      required(:exception).maybe(:str?)
      optional(:title_link).maybe(:hash?)
      optional(:details).maybe(:array?)
    end
  end
end
