# frozen_string_literal: true

require 'rails_helper'

RSpec::Matchers.define_negated_matcher :not_change, :change

describe CampaignUsers::ResetCampaign do
  let(:test) { { 'test' => true } }
  let(:user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment, :with_report) }
  let(:report) { assessment.reports.first }
  let(:norm) { create(:norm) }
  let!(:external_user_assessment) do
    create(:user_assessment, :with_hogan_assessment, campaign: campaign, subject: user, evaluator: user,
      status: :not_started, completed_at: Time.zone.now, norm_id: norm.id, expiry_date: Time.zone.now,
      started_at: Time.zone.now)
  end
  let!(:users_result) do
    users_result = create(
      :users_result,
      subject: user,
      evaluator: user,
      assessment: assessment,
      campaign: campaign,
      answers: test,
      scoring: test,
      embedded_data: test,
      step: 100,
      occupations: test
    )
    users_result.user_assessment.update!(
      completion_reason: :user_completed, status: 'completed', completed_at: Time.zone.now,
      norm_id: norm.id, expiry_date: Time.zone.now, last_activity_at: Time.zone.now, selected_locale: 'en',
      additional_time: 10, started_at: Time.zone.now
    )
    users_result
  end
  let(:user_assessment) do
    users_result.user_assessment
  end
  let(:user_report) do
    create(:user_report, report: report, user: user, campaign: campaign, status: :prepared)
  end
  let!(:campaign_user) do
    create(
      :campaign_user,
      campaign: campaign,
      user: user,
      completion_status: :in_progress,
      status: :in_progress,
      started_at: Time.zone.now,
      completed_at: Time.zone.now,
      expiry_date: Time.zone.now,
      campaign_scores_finalized: true,
      campaign_scores_calculated_date: Time.zone.now,
      campaign_scores_finalized_date: Time.zone.now
    )
  end
  let!(:media_response) { create(:media_response, users_result: users_result) }

  subject { described_class.call(campaign, user) }

  it '.call!' do
    expect(described_class).to respond_to(:call!).with_unlimited_arguments
  end

  it 'resets iternal user assessment' do
    expect { subject }.to change { user_assessment.reload.status }.from('completed').to('not_started').
      and change { user_assessment.reload.completed_at }.from(Time.zone.now).to(nil).
      and change { user_assessment.reload.completion_reason }.from('user_completed').to(nil).
      and change { user_assessment.reload.norm_id }.from(norm.id).to(nil).
      and change { user_assessment.reload.reset_count }.from(0).to(1).
      and change { user_assessment.reload.expiry_date }.from(Time.zone.now).to(nil).
      and change { user_assessment.reload.selected_locale }.from('en').to(nil).
      and change { user_assessment.reload.additional_time }.from(10).to(nil).
      and change { user_assessment.reload.started_at }.from(Time.zone.now).to(nil).
      and change { user_assessment.reload.last_activity_at }.from(Time.zone.now).to(nil)
  end

  it 'resets campaign user' do
    expect { subject }.to change { campaign_user.reload.completion_status }.from('in_progress').to('not_started').
      and change { campaign_user.reload.status }.from('in_progress').to('not_started').
      and change { campaign_user.reload.started_at }.from(Time.zone.now).to(nil).
      and change { campaign_user.reload.completed_at }.from(Time.zone.now).to(nil).
      and change { campaign_user.reload.expiry_date }.from(Time.zone.now).to(nil).
      and change { campaign_user.reload.campaign_scores_finalized }.from(true).to(false).
      and change { campaign_user.reload.campaign_scores_calculated_date }.from(Time.zone.now).to(nil).
      and change { campaign_user.reload.campaign_scores_finalized_date }.from(Time.zone.now).to(nil)
  end

  it 'removes media responses' do
    expect { subject }.to change { MediaResponse.count }.from(1).to(0)
  end

  it 'resets user result' do
    expect { subject }.to change { users_result.reload.answers }.from(test).to({}).
      and change { users_result.reload.scoring }.from(test).to(nil).
      and change { users_result.reload.occupations }.from(test).to(nil).
      and change { users_result.reload.embedded_data }.from(test).to(nil).
      and change { users_result.reload.step }.from(100).to(0)
  end
end
