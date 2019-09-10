# frozen_string_literal: true

require 'rails_helper'

describe Clients::Assessments::UpdateAssessmentForm do
  subject { described_class.new }
  it {
    is_expected.to respond_to(:assessments_client_ids, :removing_assessment_ids,
                              :is_applying_to_existing_users, :is_removing_dependent_reports)
  }
end
