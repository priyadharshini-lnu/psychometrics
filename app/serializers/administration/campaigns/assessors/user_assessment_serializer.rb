# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentSerializer < Panko::Serializer
        attributes :id, :assessment_name, :subject_name, :subject_email, :status, :permissions

        delegate :email, to: :subject, prefix: true

        def assessment_name
          object.assessment.name
        end

        def status
          object.users_result.status
        end

        def subject_name
          subject.decorate.full_name
        end

        def permissions
          GetPermissionsHash.call!(
            Administration::Campaigns::Assessors::UserAssessmentPolicy,
            current_user,
            nil,
            [
              %w[reset_evaluation reset]
            ],
            {
              project_id: context[:project_id],
              campaign_id: context[:campaign_id]
            }
          )
        end

        private

        def current_user
          context[:current_user]
        end

        def subject
          object.subject
        end
      end
    end
  end
end
