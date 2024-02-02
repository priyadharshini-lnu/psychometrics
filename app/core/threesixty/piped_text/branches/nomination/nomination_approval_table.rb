# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module Nomination
        class NominationApprovalTable < ::PipedText::BaseField
          def call
            broadcast :ok, nomination_approval_table
          end

          private

          def nomination_approval_table
            ActionController::Base.render(
              template: '_templates/nomination_approval_table', assigns: { nominations: nominations }
            )
          end

          def nominations
            campaign = context[:threesixty_campaign]
            recipient = context[:recipient]

            subject_ids = Threesixty::Participant.
                          joins(:relationship).
                          where(
                            campaign_id: campaign.campaign_id,
                            user_assessments: { evaluator_id: recipient.id },
                            relationships: { name: 'Manager', type: Relationship.types[:global] }
                          ).pluck(:subject_id)

            Threesixty::Participant.where(campaign_id: campaign.campaign_id, subject_id: subject_ids).
              where(manager_nomination_status: :waiting)
          end
        end
      end
    end
  end
end
