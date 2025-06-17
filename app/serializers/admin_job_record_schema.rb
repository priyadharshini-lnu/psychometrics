# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/AbcSize

class AdminJobRecordSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      optional(:id).filled(:int?)
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

      optional(:subjobs).maybe(:array?).each do
        hash do
          optional(:id).filled(:int?)
          optional(:operation).filled(:str?)
          optional(:progress).filled(:int?)
          optional(:data).maybe(:hash?)
          optional(:status).filled(:str?)
          optional(:error_messages).maybe(:array?)
          optional(:content).maybe(:str?)
          optional(:read).filled(:bool?)
          optional(:created_at).filled(:str?)
          optional(:is_valid).filled(:bool?)
          optional(:exception).maybe(:str?)
          optional(:title_link).maybe(:hash?)
          optional(:details).maybe(:array?)
        end
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
