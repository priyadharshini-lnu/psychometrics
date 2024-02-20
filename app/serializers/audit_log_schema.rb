# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/AbcSize
# rubocop:disable Lint/UnderscorePrefixedVariableName

class AuditLogSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:action).filled(:str?)
      required(:campaign_id).maybe(:int?)
      required(:client_id).maybe(:int?)
      required(:payload).maybe(:hash?)
      required(:project_id).maybe(:int?)
      required(:record_id).maybe(:int?)
      required(:record_type).filled(:str?)
      required(:request).maybe(:hash?)
      required(:user_id).maybe(:int?)
      required(:created_at).filled(:str?)
      required(:request_uuid).maybe(:str?)
      required(:client_ip).maybe(:str?)
      required(:interface).maybe(:str?)
      required(:user_agent).maybe(:str?)
      required(:outcome).filled(:str?)
      required(:failure_reason).maybe(:str?)
      required(:client).maybe do
        hash do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
        end
      end
      required(:project).maybe do
        hash do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
        end
      end
      required(:campaign).maybe do
        hash do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:project_id).filled(:int?)
        end
      end
      required(:user).maybe do
        hash do
          required(:email).filled(:str?)
          required(:full_name).filled(:str?)
        end
      end
      required(:active_record_audits).array(ActiveRecordAuditSchema.schema(_, _))
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
