# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentSerializer < ActiveModel::Serializer
        attributes :id, :assessment_name, :subject_name, :subject_email, :status

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

        private

        def subject
          object.subject
        end
      end
    end
  end
end
