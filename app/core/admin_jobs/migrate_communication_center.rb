# frozen_string_literal: true

module AdminJobs
  class MigrateCommunicationCenter < AdminJobs::Base
    def call
      client = ActsAsTenant.without_tenant { Client.find_by(id: record.data['client_id']) }

      unless client
        broadcast :error, I18n.t('admin_jobs.client_not_found', id: record.data['client_id'])
        return
      end

      result = CommunicationCenter::Migrate.new(client).call

      if result[:errors].any?
        broadcast :ok, {
          error_messages: result[:errors]
        }
      else
        broadcast :ok
      end
    end

    def generate_title_link
      client_name = ActsAsTenant.without_tenant { Client.find_by(id: record.data['client_id'])&.name }

      {
        href: nil,
        label: client_name || record.data['client_id']
      }
    end

    def valid?
      ActsAsTenant.without_tenant { Client.exists?(id: record.data['client_id']) }
    end
  end
end
