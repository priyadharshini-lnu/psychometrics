# frozen_string_literal: true

class ActiveRecordAuditSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:auditable_type).filled(:str?)
      required(:auditable_id).filled(:int?)
      required(:action).filled(:str?)
      required(:audited_changes).maybe(:hash?)
    end
  end
end
