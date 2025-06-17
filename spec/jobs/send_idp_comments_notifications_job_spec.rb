# frozen_string_literal: true

require 'rails_helper'

describe SendIdpCommentsNotificationsJob, type: :job do
  let!(:manager) { create(:user, :with_project_membership) }
  let!(:user) { create(:user, manager_id: manager.id) }
  let!(:campaign) { create(:campaign, project: manager.project) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user, campaign: campaign, active: true, status: :pending_approval)
  end
  let!(:job_track_record) { create(:last_job_run, :completed_yesterday, name: described_class.name) }

  def create_user_unread_comment(plan = user_idp_plan, creator = manager, created_time = 1.minute.ago)
    create(:user_idp_comment, user_idp_plan: plan, created_by: creator, created_at: created_time)
  end

  def create_manager_unread_comment(plan = user_idp_plan, creator = user, created_time = 1.minute.ago)
    create(:user_idp_comment, user_idp_plan: plan, created_by: creator, created_at: created_time)
  end

  describe '#perform' do
    context 'when users have unread comments' do
      let!(:comment) { create_user_unread_comment }

      it 'sends user notification email' do
        expect(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          with(user.id, campaign.id).
          and_return(double(deliver_later: true))

        described_class.perform_now
      end

      it 'creates event delivery record for user notification' do
        allow(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          and_return(double(deliver_later: true))

        expect do
          described_class.perform_now
        end.to change { EventDelivery.count }.by(1)

        event_delivery = EventDelivery.find_by(resource: user)
        expect(event_delivery.event_type).to eq('user_idp_unread_comments')
        expect(event_delivery.delivery_type).to eq('email')
        expect(event_delivery.sent_at).to be_within(1.second).of(Time.zone.now)
        expect(event_delivery.meta).to include('campaign_id' => campaign.id)
      end
    end

    context 'when managers have unread comments from team' do
      let!(:comment) { create_manager_unread_comment }

      it 'sends manager notification email' do
        expect(Idp::CommentNotificationMailer).to receive(:manager_unread_comments).
          with(manager.id, campaign.id).
          and_return(double(deliver_later: true))

        described_class.perform_now
      end

      it 'creates event delivery record for manager notification' do
        allow(Idp::CommentNotificationMailer).to receive(:manager_unread_comments).
          and_return(double(deliver_later: true))

        expect do
          described_class.perform_now
        end.to change { EventDelivery.count }.by(1)

        event_delivery = EventDelivery.find_by(resource: manager)
        expect(event_delivery.event_type).to eq('user_idp_unread_comments')
        expect(event_delivery.delivery_type).to eq('email')
        expect(event_delivery.sent_at).to be_within(1.second).of(Time.zone.now)
        expect(event_delivery.meta).to include('campaign_id' => campaign.id)
      end
    end

    context 'when both users and managers have unread comments' do
      let!(:user_comment) { create_user_unread_comment(user_idp_plan, manager, 30.minutes.ago) }
      let!(:manager_comment) { create_manager_unread_comment(user_idp_plan, user, 25.minutes.ago) }

      it 'sends both user and manager notification emails' do
        expect(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          with(user.id, campaign.id).
          and_return(double(deliver_later: true))

        expect(Idp::CommentNotificationMailer).to receive(:manager_unread_comments).
          with(manager.id, campaign.id).
          and_return(double(deliver_later: true))

        described_class.perform_now
      end

      it 'creates event delivery records for both notifications' do
        allow(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          and_return(double(deliver_later: true))
        allow(Idp::CommentNotificationMailer).to receive(:manager_unread_comments).
          and_return(double(deliver_later: true))

        expect do
          described_class.perform_now
        end.to change { EventDelivery.count }.by(2)
      end
    end

    context 'with multiple campaigns' do
      let!(:campaign2) { create(:campaign, project: manager.project) }
      let!(:user2) { create(:user, manager_id: manager.id) }
      let!(:user2_idp_plan) do
        create(:user_idp_plan, user: user2, campaign: campaign2, active: true)
      end

      let!(:comment1) { create_user_unread_comment(user_idp_plan, manager, 30.minutes.ago) }
      let!(:comment2) { create_user_unread_comment(user2_idp_plan, manager, 25.minutes.ago) }

      it 'sends separate notifications for each campaign' do
        expect(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          with(user.id, campaign.id).
          and_return(double(deliver_later: true))

        expect(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          with(user2.id, campaign2.id).
          and_return(double(deliver_later: true))

        described_class.perform_now
      end
    end

    context 'with multiple users in same campaign' do
      let!(:user2) { create(:user, manager_id: manager.id) }
      let!(:user2_plan) do
        create(:user_idp_plan, user: user2, campaign: campaign, active: true)
      end

      let!(:comment1) { create_user_unread_comment(user_idp_plan, manager, 30.minutes.ago) }
      let!(:comment2) { create_user_unread_comment(user2_plan, manager, 25.minutes.ago) }

      it 'sends notifications to all users with unread comments' do
        expect(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          with(user.id, campaign.id).
          and_return(double(deliver_later: true))

        expect(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          with(user2.id, campaign.id).
          and_return(double(deliver_later: true))

        described_class.perform_now
      end

      it 'creates event delivery records for all users' do
        allow(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          and_return(double(deliver_later: true))

        expect do
          described_class.perform_now
        end.to change { EventDelivery.count }.by(2)
      end
    end

    context 'when comments are already read' do
      let!(:comment) { create_user_unread_comment(user_idp_plan, manager, 30.minutes.ago) }

      before do
        comment.update!(read_by_user_ids: [user.id])
      end

      it 'does not send any notifications' do
        expect(Idp::CommentNotificationMailer).not_to receive(:user_unread_comments)
        expect(Idp::CommentNotificationMailer).not_to receive(:manager_unread_comments)

        described_class.perform_now
      end

      it 'does not create any event delivery records' do
        expect do
          described_class.perform_now
        end.not_to(change { EventDelivery.count })
      end
    end

    context 'when manager has already read reportee comments' do
      let!(:comment) { create_manager_unread_comment(user_idp_plan, user, 30.minutes.ago) }

      before do
        comment.update!(read_by_user_ids: [manager.id])
      end

      it 'does not send manager notifications' do
        expect(Idp::CommentNotificationMailer).not_to receive(:user_unread_comments)
        expect(Idp::CommentNotificationMailer).not_to receive(:manager_unread_comments)

        described_class.perform_now
      end

      it 'does not create any event delivery records' do
        expect do
          described_class.perform_now
        end.not_to(change { EventDelivery.count })
      end
    end

    context 'when some comments are read and some are unread' do
      let!(:read_comment) { create_user_unread_comment(user_idp_plan, manager, 30.minutes.ago) }
      let!(:unread_comment) { create_user_unread_comment(user_idp_plan, manager, 25.minutes.ago) }

      before do
        read_comment.update!(read_by_user_ids: [user.id])
      end

      it 'sends notifications for users with unread comments' do
        expect(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          with(user.id, campaign.id).
          and_return(double(deliver_later: true))

        described_class.perform_now
      end

      it 'creates event delivery record for user with unread comments' do
        allow(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          and_return(double(deliver_later: true))

        expect do
          described_class.perform_now
        end.to change { EventDelivery.count }.by(1)
      end
    end

    context 'when comments are outside timeframe' do
      let!(:old_comment) do
        create_user_unread_comment(user_idp_plan, manager, 2.days.ago)
      end

      it 'does not send notifications for old comments' do
        expect(old_comment.created_at).to be_before(job_track_record.started_at)

        expect(Idp::CommentNotificationMailer).not_to receive(:user_unread_comments)
        expect(Idp::CommentNotificationMailer).not_to receive(:manager_unread_comments)

        described_class.perform_now
      end
    end

    context 'when plan is inactive' do
      before do
        user_idp_plan.update!(active: false)
      end

      let!(:comment) { create_user_unread_comment(user_idp_plan, manager, 30.minutes.ago) }

      it 'does not send notifications for inactive plans' do
        expect(Idp::CommentNotificationMailer).not_to receive(:user_unread_comments)
        expect(Idp::CommentNotificationMailer).not_to receive(:manager_unread_comments)

        described_class.perform_now
      end
    end

    context 'when no campaigns have recent activity' do
      it 'does not send any notifications' do
        expect(Idp::CommentNotificationMailer).not_to receive(:user_unread_comments)
        expect(Idp::CommentNotificationMailer).not_to receive(:manager_unread_comments)

        described_class.perform_now
      end

      it 'does not create any event delivery records' do
        expect do
          described_class.perform_now
        end.not_to(change { EventDelivery.count })
      end
    end

    context 'job tracking' do
      let!(:comment) { create_user_unread_comment(user_idp_plan, manager, 30.minutes.ago) }

      it 'updates the job track record' do
        allow(Idp::CommentNotificationMailer).to receive(:user_unread_comments).
          and_return(double(deliver_later: true))

        older_started_at = job_track_record.started_at
        older_finished_at = job_track_record.finished_at

        described_class.perform_now

        expect(job_track_record.reload.started_at).to be_after(older_started_at)
        expect(job_track_record.reload.finished_at).to be_after(older_finished_at)
      end
    end
  end
end
