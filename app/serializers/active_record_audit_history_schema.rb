# frozen_string_literal: true

class ActiveRecordAuditHistorySchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:version).maybe(:int?)
      required(:action).filled(:str?)
      required(:auditable_type).filled(:str?)
      required(:auditable_id).filled(:int?)
      required(:auditable_name).maybe(:str?)
      required(:created_at).filled(:str?)
      required(:request_uuid).maybe(:str?)
      required(:audited_changes).maybe(:hash?)
      required(:audit_log_id).maybe(:int?)
      required(:user).maybe do
        hash do
          required(:email).filled(:str?)
          required(:full_name).filled(:str?)
        end
      end
    end
  end
end
