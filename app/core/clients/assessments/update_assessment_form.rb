module Clients
  module Assessments
    class UpdateAssessmentForm < Rectify::Form
      # Fields
      attribute :assessments_client_ids, Array[Integer]
      attribute :removing_assessment_ids, Array[Integer]
      attribute :is_applying_to_existing_users, Boolean
      attribute :is_removing_dependent_reports, Boolean
    end
  end
end
