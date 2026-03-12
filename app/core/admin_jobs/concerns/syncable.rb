# frozen_string_literal: true

module AdminJobs
  module Concerns
    module Syncable
      extend ActiveSupport::Concern

      def complete_admin_job!
        return unless admin_job_record_id

        admin_job_record&.increment_completed_tasks!
      end

      def fail_admin_job!(error_messages = [])
        return unless admin_job_record_id

        admin_job_record&.fail!(error_messages)
      end

      def admin_job_record
        @admin_job_record ||= AdminJobRecord.find_by(id: admin_job_record_id)
      end
    end
  end
end
