# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::SetCompletionStatus do
  let(:campaign_user) { create(:campaign_user) }
  let(:campaign_id) { campaign_user.campaign_id }
  let(:subject_id) { campaign_user.user_id }

  it 'sets completion_status to completed if any assessment is ineligible' do
    user_assessments = create_list(:user_assessment, 2, :with_result,
                                   subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id)
    user_assessments.first.update(status: :ineligible)
    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('completed')
  end

  it 'sets completion_status to not_started if there are assessment assigned to the user' do
    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('not_started')
  end

  it 'sets completion_status to not_started if no user assessment is in progress or completed' do
    create_list(:user_assessment, 2, :with_result,
                subject_id: subject_id, campaign_id: campaign_id, status: :not_started)
    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('not_started')
  end

  it 'sets completion_status to completed if all user assessments are completed' do
    create_list(:user_assessment, 2, :with_result,
                subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id, status: :completed)

    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('completed')
  end

  it 'set completion status to in_progress if some user_assessment is completed or in progress' do
    create(:user_assessment, :with_result, subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id,
           status: :not_started)
    create(:user_assessment, :with_result, subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id,
           status: :in_progress)
    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('in_progress')
  end

  it 'set completion status to completed if some use_assessment is ineligible' do
    create(:user_assessment, :with_result, subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id,
           status: :ineligible)

    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('completed')
  end

  it 'set started_at if some user_assessment is completed or in progress' do
    create(:user_assessment, :with_result, subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id,
           status: :not_started)
    create(:user_assessment, :with_result, subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id,
           status: :in_progress)
    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('in_progress')
    expect(campaign_user.reload.started_at).not_to be_nil
  end

  it 'do not set started_at if all user_assessments are not_started' do
    create(:user_assessment, :with_result, subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id,
           status: :not_started)

    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('not_started')
    expect(campaign_user.reload.started_at).to be_nil
  end

  it 'do not update started_at if exist' do
    existing_started_at = '2024-11-11'.to_datetime
    campaign_user.update!(started_at: existing_started_at)
    create(:user_assessment, :with_result, subject_id: subject_id, evaluator_id: subject_id, campaign_id: campaign_id,
           status: :in_progress)
    described_class.call!(campaign_user)

    expect(campaign_user.reload.completion_status).to eq('in_progress')
    expect(campaign_user.reload.started_at).to eq(existing_started_at)
  end
end
