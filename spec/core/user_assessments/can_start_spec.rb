# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::CanStart do
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign_user) { create(:campaign_user, user: user) }
  let!(:campaign) { campaign_user.campaign }
  let!(:assessment) { create(:assessment, category: Assessment::PSYCHOMETRIC) }

  it 'returns false' do
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)
    user.project.privacy_setting.privacy_consent = false

    expect(described_class.call!(user_assessment, user, {})).to eq(false)
  end

  it 'returns true if privacy contest required' do
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)

    expect(described_class.call!(user_assessment, user, {})).to eq(true)
  end

  it 'returns true if system checks required' do
    assessment.extra = { enable_audio_check: true }
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)

    expect(described_class.call!(user_assessment, user, {})).to eq(true)
  end

  it 'returns false if system checks passed' do
    assessment.extra = { enable_audio_check: true }
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)
    user.project.privacy_setting.privacy_consent = false

    expect(described_class.call!(user_assessment, user, { 'checking_wizard.audio' => true })).to eq(false)
  end

  it 'returns false when campaign-level system check is enabled and assessment-level checks are skipped' do
    assessment.extra = { enable_audio_check: true }
    campaign.campaign_options.update!(system_check_enabled: true, skip_assessment_level_checks: true)
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)
    user.project.privacy_setting.privacy_consent = false

    expect(described_class.call!(user_assessment, user, {})).to eq(false)
  end

  it 'returns true when campaign-level system check is enabled and assessment-level checks are not skipped' do
    assessment.extra = { enable_audio_check: true }
    campaign.campaign_options.update!(system_check_enabled: true, skip_assessment_level_checks: false)
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)

    expect(described_class.call!(user_assessment, user, {})).to eq(true)
  end

  it 'returns true when campaign-level system checks are disabled even if assessment-level checks are marked to skip' do
    assessment.extra = { enable_audio_check: true }
    campaign.campaign_options.update!(system_check_enabled: false, skip_assessment_level_checks: true)
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)

    expect(described_class.call!(user_assessment, user, {})).to eq(true)
  end
end
