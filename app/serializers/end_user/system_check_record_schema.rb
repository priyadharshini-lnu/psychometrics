# frozen_string_literal: true

class EndUser::SystemCheckRecordSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:check_type).filled(:str?)
      required(:passed).filled(:bool?)
      required(:data).filled(:hash?)
      required(:created_at).filled(:str?)
      optional(:finished_at).maybe(:str?)
      optional(:video_url).maybe(:str?)
    end
  end
end
