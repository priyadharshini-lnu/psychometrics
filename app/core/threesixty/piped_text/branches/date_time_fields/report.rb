# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module DateTimeFields
        class Report < ::PipedText::BaseField
          SELF_EVALUATION = 'SelfEvaluation'

          def call
            return nil unless threesixty_campaign

            date = path.last == SELF_EVALUATION ? self_evaluation_date : last_evaluation_date

            broadcast :ok, date&.strftime(params['f'])
          end

          private

          def self_evaluation_date
            UserAssessment.find_by(
              subject_id: subject.id,
              evaluator_id: subject.id,
              campaign_id: threesixty_campaign.campaign_id
            ).completed_at
          end

          def last_evaluation_date
            threesixty_campaign.participants.
              where(subject_id: subject.id).
              completed.
              order(:completed_at).
              last&.
              completed_at
          end

          def subject
            context[:subject]
          end

          def threesixty_campaign
            context[:threesixty_campaign]
          end
        end
      end
    end
  end
end
