# frozen_string_literal: true

require 'rails_helper'

describe CampaignUser, type: :model do
  describe 'Validations' do
    it 'does not allow same current and target job roles' do
      job_role = create(:job_role)
      campaign_user = build(:campaign_user, current_job_role: job_role, target_job_role: job_role)

      expect(campaign_user).not_to be_valid
      expect(campaign_user.errors[:base]).to include(I18n.t('admin.campaign_user_job_roles_cannot_be_same'))
    end
  end

  describe 'Callbacks' do
    context '#publish_campaign_results_available' do
      let!(:campaign_user) { create(:campaign_user) }
      let!(:campaign_factor) { create(:campaign_factor, campaign: campaign_user.campaign) }

      it 'publishes campaign_results_available webhook event' do
        webhook = CampaignUsers::Webhook.new(campaign_user)
        expect(WebhookSubscriptions::Publish).to receive(:call).with(
          campaign_user.campaign.project,
          :campaign_results_available,
          webhook.send(:campaign_results_available_data),
          webhook_id: nil
        )
        campaign_user.update(campaign_scores_finalized: true)
      end

      it 'does not publish campaign_results_available webhook event if campaign_scores_finalized is false' do
        expect(WebhookSubscriptions::Publish).not_to receive(:call)
        campaign_user.update(campaign_scores_finalized: false)
      end
    end

    context '#publish_campaign_user_status' do
      let(:campaign) { create(:campaign) }
      let(:user) { create(:user) }

      it 'publishes campaign_user_status webhook event when user is created' do
        expect_any_instance_of(CampaignUsers::Webhook).to receive(:publish_campaign_user_status)

        create(:campaign_user, campaign: campaign, user: user, status: :not_started)
      end

      it 'publishes campaign_user_status webhook event when status changes' do
        campaign_user = create(:campaign_user, campaign: campaign, user: user, status: :not_started)

        expect_any_instance_of(CampaignUsers::Webhook).to receive(:publish_campaign_user_status)

        campaign_user.update(status: :in_progress)
      end

      it 'does not publish campaign_user_status webhook when status does not change' do
        campaign_user = create(:campaign_user, campaign: campaign, user: user, status: :not_started)

        expect_any_instance_of(CampaignUsers::Webhook).not_to receive(:publish_campaign_user_status)

        campaign_user.update(active: false)
      end
    end
  end

  describe 'scheduled_at' do
    it 'if campaign is inactive, gives max date between campaign start_date and schedule_start_date' do
      campaign = create(:campaign, status: :inactive, start_date: 2.days.from_now)
      campaign_user = create(:campaign_user, campaign: campaign, schedule_start_date: 1.day.from_now)

      expect(campaign_user.scheduled_at).to eq(campaign.start_date)
    end

    it 'if campaign is active returns cam schedule_start_date' do
      campaign = create(:campaign, status: :active, start_date: 1.day.from_now)
      campaign_user = create(:campaign_user, campaign: campaign, schedule_start_date: 2.days.from_now)

      expect(campaign_user.scheduled_at).to eq(campaign_user.schedule_start_date)
    end

    it 'returns nil if there is no schedule_start_date and campaign is active' do
      campaign = create(:campaign, status: :active, start_date: 1.day.from_now)
      campaign_user = create(:campaign_user, campaign: campaign, schedule_start_date: nil)
      expect(campaign_user.scheduled_at).to eq(nil)
    end
  end

  describe 'in_schedule?' do
    it 'returns true if schedule started but not ended or return false' do
      campaign = create(:campaign, status: :active)

      campaign_user = create(
        :campaign_user, campaign: campaign, schedule_start_date: 1.day.ago,
        schedule_end_date: 2.days.from_now
      )
      expect(campaign_user.in_schedule?).to eq(true)

      campaign_user = create(
        :campaign_user, campaign: campaign, schedule_start_date: 1.day.from_now,
        schedule_end_date: 2.days.from_now
      )
      expect(campaign_user.in_schedule?).to eq(false)

      campaign_user = create(
        :campaign_user, campaign: campaign, schedule_start_date: 2.days.ago,
        schedule_end_date: 1.day.ago
      )
      expect(campaign_user.in_schedule?).to eq(false)
    end
  end

  describe 'compute_expiry_date' do
    it 'returns time in future determined by additional_time if interrupted_campaign' do
      campaign = create(:campaign)
      campaign.campaign_options.update(fixed_time: true, fixed_time_duration: 120)
      campaign_user = create(:campaign_user, campaign: campaign, additional_time: 60, status: :interrupted)

      expect(campaign_user.compute_expiry_date).to eq(60.seconds.from_now)
    end

    it 'returns time in future determined by fixed_time_duration if not_started_campaign' do
      campaign = create(:campaign)
      campaign.campaign_options.update(fixed_time: true, fixed_time_duration: 120)
      campaign_user = create(:campaign_user, campaign: campaign, additional_time: 60, status: :not_started)

      expect(campaign_user.compute_expiry_date).to eq(120.seconds.from_now)
    end

    it 'returns expiry_date if present' do
      campaign = create(:campaign)
      campaign.campaign_options.update(fixed_time: true, fixed_time_duration: 120)
      campaign_user = create(:campaign_user, campaign: campaign, expiry_date: 60.seconds.from_now, status: :in_progress)

      expect(campaign_user.compute_expiry_date).to eq(60.seconds.from_now)
    end
  end

  describe 'real_expiry_date' do
    context 'fixed_time campaign with campaign end date' do
      it 'returns smallest expiry time between campaign end_time and campaign_user expiry_date' do
        smallest_time = 30.minutes.from_now
        largest_time = 60.minutes.from_now
        campaign_user = build(
          :campaign_user,
          expiry_date: smallest_time,
          campaign: build(
            :campaign, end_date: largest_time, campaign_options: build(:campaign_option, fixed_time: true)
          )
        )
        expect(campaign_user.real_expiry_date).to eq(smallest_time)

        campaign_user = build(
          :campaign_user,
          expiry_date: largest_time,
          campaign: build(
            :campaign, end_date: smallest_time, campaign_options: build(:campaign_option, fixed_time: true)
          )
        )
        expect(campaign_user.real_expiry_date).to eq(smallest_time)
      end
    end

    context 'fixed_time without campaign end_date' do
      it 'returns campaign_user expiry_date' do
        time = 60.minutes.from_now
        campaign_user = build(
          :campaign_user,
          expiry_date: time,
          campaign: build(:campaign, end_date: nil, campaign_options: build(:campaign_option, fixed_time: true))
        )

        expect(campaign_user.real_expiry_date).to eq(time)
      end
    end

    context 'campaign end_time and not a fixed_time campaign' do
      it 'returns campaign end_time' do
        time = 60.minutes.from_now
        campaign_user = build(
          :campaign_user,
          campaign: build(:campaign, end_date: time, campaign_options: build(:campaign_option, fixed_time: false))
        )

        expect(campaign_user.real_expiry_date).to eq(time)
      end

      it 'returns campaign end_date even if campaign_users expiry_date is set' do
        end_date = 60.minutes.from_now
        expiry_date = 30.minutes.from_now
        campaign_user = build(
          :campaign_user,
          expiry_date: expiry_date,
          campaign: build(:campaign, end_date: end_date, campaign_options: build(:campaign_option, fixed_time: false))
        )

        expect(campaign_user.real_expiry_date).to eq(end_date)
      end
    end
  end

  describe 'Associations' do
    describe '#workshop_invited_subjects' do
      let(:campaign) { create(:campaign) }
      let(:other_campaign) { create(:campaign) }
      let(:user) { create(:user) }
      let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
      let!(:other_campaign_user) { create(:campaign_user, campaign: other_campaign, user: user) }

      it 'only includes workshop_invited_subjects from the current campaign' do
        # Create an invite in the current campaign
        current_invite = create(:workshop_invite, campaign: campaign)
        current_subject = create(:workshop_invited_subject, workshop_invite: current_invite, user: user)

        # Create an invite in a different campaign
        other_invite = create(:workshop_invite, campaign: other_campaign)
        other_subject = create(:workshop_invited_subject, workshop_invite: other_invite, user: user)

        # Verify only the current campaign's subject is included
        expect(campaign_user.workshop_invited_subjects).to include(current_subject)
        expect(campaign_user.workshop_invited_subjects).not_to include(other_subject)

        # Verify the other campaign user only sees their invites
        expect(other_campaign_user.workshop_invited_subjects).to include(other_subject)
        expect(other_campaign_user.workshop_invited_subjects).not_to include(current_subject)
      end

      it 'returns empty when user is in campaign but not invited' do
        # Create an invite in the other campaign only
        other_invite = create(:workshop_invite, campaign: other_campaign)
        create(:workshop_invited_subject, workshop_invite: other_invite, user: user)

        # Verify the current campaign user sees no invites
        expect(campaign_user.workshop_invited_subjects).to be_empty
      end
    end

    describe '#workshop_subjects' do
      let(:campaign) { create(:campaign) }
      let(:other_campaign) { create(:campaign) }
      let(:user) { create(:user) }
      let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
      let!(:other_campaign_user) { create(:campaign_user, campaign: other_campaign, user: user) }

      it 'only includes workshop_subjects from the current campaign' do
        # Create a workshop subject in the current campaign
        current_subject = create(:workshop_subject, campaign: campaign, user: user)

        # Create a workshop subject in a different campaign
        other_subject = create(:workshop_subject, campaign: other_campaign, user: user)

        # Verify only the current campaign's subject is included
        expect(campaign_user.workshop_subjects).to include(current_subject)
        expect(campaign_user.workshop_subjects).not_to include(other_subject)

        # Verify the other campaign user only sees their subjects
        expect(other_campaign_user.workshop_subjects).to include(other_subject)
        expect(other_campaign_user.workshop_subjects).not_to include(current_subject)
      end

      it 'returns empty when user is in campaign but has no workshop subjects' do
        # Create a workshop subject only in the other campaign
        create(:workshop_subject, campaign: other_campaign, user: user)

        # Verify the current campaign user sees no subjects
        expect(campaign_user.workshop_subjects).to be_empty
      end
    end
  end
end
