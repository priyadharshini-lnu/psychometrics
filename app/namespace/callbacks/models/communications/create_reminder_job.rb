module Callbacks
  module Models
    module Communications
      class CreateReminderJob
        def after_commit(record)
          return unless record.reminder?
          record.reminder_job.perform_later(record.id)
        end
      end
    end
  end
end
