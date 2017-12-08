module Callbacks
  module Models
    module Communications
      class CreateSendEmailJob
        def after_commit(record)
          return if record.send_email_job.blank?
          @record = record
          @record.send_email_job.set(params_for_set_job).perform_later(@record)
        end

        private

        def need_to_pass_wait_until?
          @record.specific_datetime?
        end

        def params_for_set_job
          need_to_pass_wait_until? ? { wait_until: @record.delivery_at } : {}
        end
      end
    end
  end
end
