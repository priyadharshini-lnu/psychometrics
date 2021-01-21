# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::EvaluationsCount do
  let(:assessor1) { create(:user, :assessor) }
  let(:campaign) { assessor1.assessors.first.campaign }
  let(:assessor2) { create(:user, :assessor, with_campaign: campaign) }

  it 'return total_evalaution and completed_evaluations count' do
    assessor_relationship = create(:relationship, name: 'Assessor', type: :global)

    create_list(:user_assessment, 2, evaluator: assessor1, campaign: campaign,
      relationship: assessor_relationship, users_result: create(:users_result, status: 'completed'))
    create(:user_assessment, evaluator: assessor1, campaign: campaign,
      relationship: assessor_relationship, users_result: create(:users_result, status: 'in_progress'))
    create(:user_assessment, evaluator: assessor1, campaign: campaign,
      relationship: assessor_relationship, users_result: create(:users_result, status: 'not_started'))

    create(:user_assessment, evaluator: assessor2, campaign: campaign,
      relationship: assessor_relationship, users_result: create(:users_result, status: 'completed'))
    create(:user_assessment, evaluator: assessor2, campaign: campaign,
      relationship: assessor_relationship, users_result: create(:users_result, status: 'not_started'))

    result = described_class.call!([assessor1.id, assessor2.id], campaign)
    expected_result = {}
    expected_result[assessor1.id] = { total: 4, completed: 2 }
    expected_result[assessor2.id] = { total: 2, completed: 1 }

    expect(result).to eq(expected_result)
  end
end
