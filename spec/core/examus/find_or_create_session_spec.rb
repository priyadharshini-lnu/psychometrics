# frozen_string_literal: true

require 'rails_helper'

describe Examus::FindOrCreateSession do
  let(:campaign_user) { create(:campaign_user, started_at: Time.zone.now) }
  let(:campaign) { campaign_user.campaign }
  let(:client) { campaign.client }
  let(:project) { campaign.project }
  let(:proctoring_license) do
    create(:proctoring_license, is_project_specific: false, client: client, type: :proctoring)
  end

  context 'with enough License' do
    it "creates proctoring_session if it already doesn't exists" do
      proctoring_license
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(30).at_least(:once)
      expect(campaign_user.proctoring_sessions).to be_blank
      proctoring_session = nil
      expect { proctoring_session = described_class.call(campaign_user)[:ok] }.
        to change(ProctoringSession, :count).by(1)
      expect(proctoring_session).to be_present
      expect(proctoring_session.started_at).to be_present
      expect(proctoring_session.session_id).to be_present
    end

    it 'creates proctoring_session if current_proctoring session is finished' do
      proctoring_license
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(30).at_least(:once)
      campaign_user.proctoring_sessions.create
      expect(Examus::GetSession).to receive(:call!).and_return({ 'status' => 'finished' })
      expect { described_class.call!(campaign_user) }.to change { ProctoringSession.count }.by(1)
    end

    it 'returns existing proctoring session if it is alive' do
      campaign_user.proctoring_sessions.create
      expect(Examus::GetSession).to receive(:call!).and_return({ 'status' => 'started' })
      expect { described_class.call!(campaign_user) }.to_not change(ProctoringSession, :count)
    end

    it "doesn't call examus api to check proctoring session status if session is completed" do
      campaign_user.proctoring_sessions.create(completed_at: Time.zone.now)
      expect(Examus::GetSession).to_not receive(:call!)
      described_class.call!(campaign_user)
    end

    it "doesn't call examus api to check proctoring session status if session is invalid" do
      campaign_user.proctoring_sessions.create(invalid_session: true)
      expect(Examus::GetSession).to_not receive(:call!)
      described_class.call!(campaign_user)
    end

    it "deducts license if it's not a proctoring_trial session" do
      proctoring_license
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(30).at_least(:once)
      expect { described_class.call!(campaign_user) }.to change(LicenseUsage, :count).by(1)
    end

    it "doesn't deduct license if it's a proctoring_trial session" do
      campaign_user.campaign.campaign_options.update(proctoring_trial: true)

      expect { described_class.call!(campaign_user) }.to_not change(LicenseUsage, :count)
    end
  end

  context 'with project-specific license' do
    let(:project_specific_license) do
      create(:proctoring_license, is_project_specific: true, client: campaign_user.campaign.client)
    end
    let(:project_license) do
      create(:project_license, project: project, license: project_specific_license,
      usage_limit: 30, used_number: 0, enabled: true)
    end

    it 'creates proctoring session and deducts both license and project_license' do
      expect(project_license).to be_present

      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(10).at_least(:once)

      proctoring_session = described_class.call!(campaign_user)

      expect(proctoring_session).to be_present
      expect(project_specific_license.reload.used_number).to eq(10)
      expect(project_license.reload.used_number).to eq(10)
      expect(LicenseUsage.last.project_license_id).to eq(project_license.id)
    end

    it 'returns error if project_license is disabled' do
      project_license.update(enabled: false)
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(10).at_least(:once)
      result = described_class.call(campaign_user)

      expect(result[:error]).to eq(I18n.t('licenses.not_enough_license',
                                          client_name: client.name,
                                          report_name: 'Proctoring'))
      expect(ProctoringSession.count).to eq(0)
    end

    it 'returns error if project_license does not have enough credits' do
      project_license.update(usage_limit: 5, used_number: 5)
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(10).at_least(:once)

      result = described_class.call(campaign_user)

      expect(result[:error]).to eq(I18n.t('licenses.not_enough_license',
                                          client_name: client.name,
                                          report_name: 'Proctoring'))
      expect(ProctoringSession.count).to eq(0)
    end

    it 'creates session if project_license has enough remaining credits' do
      project_license.update(usage_limit: 30, used_number: 20)
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(10).at_least(:once)

      proctoring_session = described_class.call!(campaign_user)

      expect(proctoring_session).to be_present
      expect(project_license.reload.used_number).to eq(30)
    end

    it 'does not create license_usage if project_license is not found' do
      # Delete project_license to simulate missing association
      project_license.destroy

      result = described_class.call(campaign_user)

      expect(result[:error]).to eq(I18n.t('licenses.not_enough_license',
                                          client_name: client.name,
                                          report_name: 'Proctoring'))
      expect(LicenseUsage.count).to eq(0)
    end
  end

  context 'without enough license credits' do
    it 'returns error if there are not license credit' do
      error = described_class.call(campaign_user)[:error]

      expect(error).to eq(I18n.t('licenses.not_enough_license', client_name: client.name,
                                report_name: 'Proctoring'))
    end

    it 'returns error if project_license does not exist for project-specific license' do
      proctoring_license.update(is_project_specific: true)
      result = described_class.call(campaign_user)

      expect(result[:error]).to eq(I18n.t('licenses.not_enough_license',
                                          client_name: client.name,
                                          report_name: 'Proctoring'))
    end
  end
end
