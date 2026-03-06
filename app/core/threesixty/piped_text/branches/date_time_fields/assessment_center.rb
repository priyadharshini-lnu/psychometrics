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
            query = WorkshopSubject.joins(:workshop).
                    where(user_id: subject.id,
                          campaign_id: context[:campaign]&.id).
                    where(attendance_status: %i[on_time late])

            if campaign_assessment_group_id.present?
              query = query.where(workshop: { campaign_assessment_group_id: campaign_assessment_group_id })
            end

            workshop_subject = query.order(:created_at).last

            workshop_subject&.workshop&.start_time&.strftime(params['f'])
          end

          def subject
            context[:subject]
          end

          def campaign
            context[:campaign]
          end

          def campaign_assessment_group_id
            context[:users_result]&.user_assessment&.campaign_assessment&.campaign_assessment_group_id
          end
        end
      end
    end
  end
end
