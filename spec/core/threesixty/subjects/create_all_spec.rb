# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::CreateAll do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let!(:current_role) { create(:job_role, name: 'Developer', project: project) }
  let!(:target_role) { create(:job_role, name: 'Senior Developer', project: project) }
  let!(:global_role) { create(:job_role, name: 'Global Role', project: nil) }
  let!(:threesixty_license) do
    create(
      :license,
      client: campaign.client,
      type: 'threesixty',
      start_date: 1.day.ago,
      end_date: 1.day.from_now
    )
  end

  before do
    user = create(:user, project: project, email: 'fedor@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    create(:threesixty_subject, user: user, campaign: campaign)
    create(:relationship, name: 'Self')
  end

  describe '.call' do
    it 'duplicated emails' do
      result = described_class.
               call!([{ email: 'dev.atanov@gmail.com' }, { email: 'fedor@gmail.com' }], threesixty_campaign)
      expect(result[:subjects].map { |s| s.user.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
    end

    it 'updates existing user record' do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
      create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)

      described_class.call!([{ email: 'daniel@cc.com', first_name: 'Dan' }], threesixty_campaign)

      expect(user.reload.first_name).to eq('Dan')
    end

    it "doesn't create new subject record when subject exists" do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
      create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)

      expect do
        described_class.call!([{ email: 'daniel@cc.com', first_name: 'Dan' }], threesixty_campaign)
      end.to_not change(Threesixty::Subject, :count)
    end

    it "doesn't create participants if already exists" do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
      subject = create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)
      create(
        :threesixty_participant,
        campaign_id:  threesixty_campaign.campaign_id,
        subject_id: subject.user_id,
        evaluator_id: subject.user_id
      )

      expect do
        described_class.call!([{ email: 'daniel@cc.com', first_name: 'Dan' }], threesixty_campaign)
      end.to_not change(Threesixty::Participant, :count)
    end

    it 'saves new user with the provides password' do
      result = described_class.call!([{ email: 'daniel@cc.com', password: 'provided_password' }], threesixty_campaign)
      user = result[:subjects].first.user

      expect(user.reload.valid_password?('provided_password')).to eq(true)
    end

    it "doesn't update password for existing used" do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', password: 'old_password')
      create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)

      described_class.call!([{ email: 'daniel@cc.com', password: 'new_password' }], threesixty_campaign)

      expect(user.reload.valid_password?('old_password')).to eq(true)
    end

    it do
      result = described_class.
               call!([{ email: 'dev.atanov@gmail.com' }, { email: 'fedor@gmail.com' }], threesixty_campaign)
      participants = Threesixty::Participant.all
      expect(result[:subjects].map { |s| s.user.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
      expect(participants.map { |s| s.evaluator.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
      expect(participants.map { |s| s.subject.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
    end

    context 'with UAT flag' do
      it 'persists is_uat = true when the UI toggle is enabled' do
        result = described_class.call!([{ email: 'uat@example.com', is_uat: true }], threesixty_campaign)

        expect(result[:subjects].first.user.reload.is_uat).to eq(true)
      end

      it 'persists is_uat = false when the UI toggle is not enabled' do
        result = described_class.call!([{ email: 'plain@example.com', is_uat: false }], threesixty_campaign)

        expect(result[:subjects].first.user.reload.is_uat).to eq(false)
      end

      it 'defaults is_uat to false when nothing is provided' do
        result = described_class.call!([{ email: 'default@example.com' }], threesixty_campaign)

        expect(result[:subjects].first.user.reload.is_uat).to eq(false)
      end

      it 'persists is_uat = true for a "Yes" value in the import UAT column' do
        result = described_class.call!([{ email: 'imported@example.com', uat: 'Yes' }], threesixty_campaign)

        expect(result[:subjects].first.user.reload.is_uat).to eq(true)
      end

      it 'persists is_uat = false for a "No" value in the import UAT column' do
        result = described_class.call!([{ email: 'imported@example.com', uat: 'No' }], threesixty_campaign)

        expect(result[:subjects].first.user.reload.is_uat).to eq(false)
      end

      it 'persists is_uat = false for a blank value in the import UAT column' do
        result = described_class.call!([{ email: 'imported@example.com', uat: '' }], threesixty_campaign)

        expect(result[:subjects].first.user.reload.is_uat).to eq(false)
      end

      it 'does not change is_uat for an already existing subject' do
        user = create(:user, project: threesixty_campaign.project, email: 'existing-uat@example.com', is_uat: true)
        create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)

        expect do
          described_class.call!([{ email: 'existing-uat@example.com', is_uat: false, first_name: 'Dan' }],
                                threesixty_campaign)
        end.to_not(change { user.reload.is_uat })

        expect(user.reload.first_name).to eq('Dan')
      end
    end

    context 'with job role assignments' do
      it 'assigns current and target job roles to new users' do
        subject_data = {
          email: 'new@example.com',
          current_job_role: 'Developer',
          target_job_role: 'Senior Developer'
        }

        result = described_class.call!([subject_data], threesixty_campaign)
        campaign_user = CampaignUser.find_by(user: result[:subjects].first.user, campaign: campaign)

        expect(campaign_user.current_job_role).to eq(current_role)
        expect(campaign_user.target_job_role).to eq(target_role)
      end

      it 'updates job roles for existing users' do
        user = create(:user, project: project, email: 'existing@example.com')
        create(:campaign_user, user: user, campaign: campaign)

        subject_data = {
          email: 'existing@example.com',
          target_job_role: 'Senior Developer'
        }

        described_class.call!([subject_data], threesixty_campaign)
        campaign_user = CampaignUser.find_by(user: user, campaign: campaign)

        expect(campaign_user.target_job_role).to eq(target_role)
        expect(campaign_user.current_job_role).to be_nil
      end

      it 'ignores invalid job role names' do
        subject_data = {
          email: 'invalid@example.com',
          current_job_role: 'Nonexistent Role'
        }

        result = described_class.call!([subject_data], threesixty_campaign)
        campaign_user = CampaignUser.find_by(user: result[:subjects].first.user, campaign: campaign)

        expect(campaign_user.current_job_role).to be_nil
      end
    end
  end
end
