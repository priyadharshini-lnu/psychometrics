# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::SubjectStatusesCount do
  let(:assessor) { create(:user, :assessor) }
  let(:subject1) { create(:user) }
  let(:subject2) { create(:user) }
  let(:subject3) { create(:user) }
  let(:assessor_relationship) { create(:relationship, name: 'Assessor', type: :global) }
  let(:campaign) { assessor.assessors.first.campaign }

  it 'returns count of subject along with the subject status count' do
    create_user_assessment(subject: subject1, status: :in_progress)
    create_user_assessment(subject: subject1, status: :completed)

    create_user_assessment(subject: subject2, status: :completed)
    create_user_assessment(subject: subject2, status: :completed)

    create_user_assessment(subject: subject3, status: :not_started)

    result = described_class.call!(assessor, [campaign.id])

    expect(result[campaign.id]).to eq(
      total: 3, in_progress: 1, completed: 1, not_started: 1, timed_out: 0, ineligible: 0
    )
  end

  it 'returns subject status count for passed campaign_id' do
    campaign2 = create(:campaign)
    create_user_assessment(subject: subject1, status: :completed)
    create_user_assessment(subject: subject1, status: :in_progress, campaign: campaign2)

    result = described_class.call!(assessor, [campaign.id])
    expect(result[campaign.id]).to eq(
      total: 1, in_progress: 0, completed: 1, not_started: 0, timed_out: 0, ineligible: 0
    )
    expect(result[campaign2.id]).to eq(nil)

    result = described_class.call!(assessor, [campaign.id, campaign2.id])
    expect(result[campaign.id]).to eq(
      total: 1, in_progress: 0, completed: 1, not_started: 0, timed_out: 0, ineligible: 0
    )
    expect(result[campaign2.id]).to eq(
      total: 1, in_progress: 1, completed: 0, not_started: 0, timed_out: 0, ineligible: 0
    )
  end

  private

  def create_user_assessment(opts)
    create(:user_assessment, evaluator: assessor, subject: opts[:subject], campaign: opts[:campaign] || campaign,
      relationship: assessor_relationship, status: opts[:status],
      assessment: create(:assessment, category: :assessor_form))
  end
end
