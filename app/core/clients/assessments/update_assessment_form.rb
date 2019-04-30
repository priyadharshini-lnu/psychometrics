module Clients
  module Assessments
    class UpdateAssessmentForm < Rectify::Form
      # Fields
      attribute :assessments_client_ids, Array[Integer]
      attribute :remove_assessment_ids, Array[Integer]
      attribute :apply_to_existing_users, Boolean
      attribute :remove_dependent_reports, Boolean
    end
  end
end
