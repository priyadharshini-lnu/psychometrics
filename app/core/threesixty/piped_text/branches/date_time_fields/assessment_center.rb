# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module DateTimeFields
        class AssessmentCenter < ::PipedText::BaseField
          def call
            broadcast :ok, attended_date
          end

          private

          def attended_date
            workshop_subject = WorkshopSubject.joins(:workshop).
                               where(user_id: subject.id,
                                     campaign_id: context[:campaign]&.id).
                               where(attendance_status: %i[on_time late]).
                               order(:created_at).last

            workshop_subject&.workshop&.start_time&.strftime(params['f'])
          end

          def subject
            context[:subject]
          end

          def campaign
            context[:campaign]
          end
        end
      end
    end
  end
end
