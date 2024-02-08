# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::SubjectEvaluationsCount do
  let(:assessor) { create(:user, :assessor) }
  let(:subject1) { create(:user) }
  let(:subject2) { create(:user) }
  let(:assessor_relationship) { create(:relationship, name: 'Assessor', type: :global) }
  let(:campaign) { assessor.assessors.first.campaign }

  it 'return evaluations count for subject' do
    create_user_assessment(subject: subject1, status: :completed)
    create_user_assessment(subject: subject1, status: :completed)
    create_user_assessment(subject: subject1, status: :in_progress)
    create_user_assessment(subject: subject1, status: :not_started)

    create_user_assessment(subject: subject2, status: :completed)
    create_user_assessment(subject: subject2, status: :not_started)

    result = described_class.call!([subject1.id, subject2.id], assessor, campaign.id)
    expected_result = {}
    expected_result[subject1.id] = { completed: 2, in_progress: 1, not_started: 1,
                                     interrupted: 0, timed_out: 0, ineligible: 0, total: 4 }
    expected_result[subject2.id] = { completed: 1, in_progress: 0, not_started: 1,
                                     interrupted: 0, timed_out: 0, ineligible: 0, total: 2 }

    expect(result).to eq(expected_result)
  end

  private

  def create_user_assessment(opts)
    create(:user_assessment, evaluator: assessor, subject: opts[:subject], campaign: campaign,
      relationship: assessor_relationship, status: opts[:status],
      assessment: create(:assessment, category: :assessor_form))
  end
end
