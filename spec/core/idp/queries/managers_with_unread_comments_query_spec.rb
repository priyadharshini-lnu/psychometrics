# frozen_string_literal: true

require 'rails_helper'

describe Idp::Queries::ManagersWithUnreadCommentsQuery do
  let!(:manager) { create(:user, :with_project_membership) }
  let!(:user) { create(:user, manager_id: manager.id) }
  let!(:campaign) { create(:campaign, project: manager.project) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user, campaign: campaign, active: true, approval_status: :pending_approval)
  end

  let(:recent_comments_timeframe) { 1.hour.ago..Time.current }
  let(:query) { described_class.new(campaign, recent_comments_timeframe) }

  context 'when manager has unread comments from team members' do
    let!(:comment_by_user) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    it 'returns the manager' do
      result = query.query
      expect(result).to include(manager)
    end

    it 'returns distinct managers even with multiple unread comments' do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 20.minutes.ago)

      result = query.query
      expect(result.count).to eq(1)
      expect(result).to include(manager)
    end
  end

  context 'when manager has read the comments' do
    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    before do
      comment.update!(read_by_user_ids: [manager.id])
    end

    it 'does not return the manager' do
      result = query.query
      expect(result).not_to include(manager)
    end
  end

  context 'when manager created the comment themselves' do
    let!(:self_comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    it 'does not return the manager' do
      result = query.query
      expect(result).not_to include(manager)
    end
  end

  context 'when team member has inactive plan' do
    let!(:inactive_plan) do
      create(:user_idp_plan, user: user, campaign: campaign, active: false)
    end

    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: inactive_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    it 'does not return the manager' do
      result = query.query
      expect(result).not_to include(manager)
    end
  end

  context 'when comment is outside timeframe' do
    let!(:old_comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 2.hours.ago)
    end

    it 'does not return the manager' do
      result = query.query
      expect(result).not_to include(manager)
    end
  end

  context 'when comment is from different campaign' do
    before do
      user_idp_plan.update!(active: false)

      other_campaign = create(:campaign, project: manager.project)
      other_plan = create(:user_idp_plan, user: user, campaign: other_campaign, active: true)

      create(:user_idp_comment,
             user_idp_plan: other_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    it 'does not return the manager' do
      result = query.query
      expect(result).not_to include(manager)
    end
  end

  context 'with multiple team members under same manager' do
    let!(:user2) { create(:user, manager_id: manager.id) }
    let!(:user2_plan) do
      create(:user_idp_plan, user: user2, campaign: campaign, active: true)
    end

    let!(:comment1) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    let!(:comment2) do
      create(:user_idp_comment,
             user_idp_plan: user2_plan,
             created_by: user2,
             created_at: 25.minutes.ago)
    end

    it 'returns the manager only once despite multiple team member comments' do
      result = query.query
      expect(result).to include(manager)
      expect(result.count).to eq(1)
    end

    context 'when manager has read some but not all comments' do
      before do
        comment1.update!(read_by_user_ids: [manager.id])
      end

      it 'still returns the manager if they have unread comments' do
        result = query.query
        expect(result).to include(manager)
        expect(result.count).to eq(1)
      end
    end

    context 'when manager has read all comments' do
      before do
        comment1.update!(read_by_user_ids: [manager.id])
        comment2.update!(read_by_user_ids: [manager.id])
      end

      it 'does not return the manager' do
        result = query.query
        expect(result).not_to include(manager)
      end
    end
  end

  context 'when multiple managers and users are involved' do
    let!(:manager2) { create(:user, :with_project_membership) }
    let!(:user3) { create(:user, manager_id: manager2.id) }
    let!(:user3_plan) do
      create(:user_idp_plan, user: user3, campaign: campaign, active: true)
    end

    let!(:comment_for_manager1) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    let!(:comment_for_manager2) do
      create(:user_idp_comment,
             user_idp_plan: user3_plan,
             created_by: user3,
             created_at: 25.minutes.ago)
    end

    it 'returns both managers when they have unread comments' do
      result = query.query
      expect(result).to include(manager, manager2)
      expect(result.count).to eq(2)
    end

    context 'when one manager has read their comments' do
      before do
        comment_for_manager1.update!(read_by_user_ids: [manager.id])
      end

      it 'returns only managers with unread comments' do
        result = query.query
        expect(result).to include(manager2)
        expect(result).not_to include(manager)
        expect(result.count).to eq(1)
      end
    end
  end

  context 'when comment has multiple readers including the manager' do
    let!(:other_user) { create(:user) }
    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    before do
      comment.update!(read_by_user_ids: [other_user.id, manager.id, user.id])
    end

    it 'does not return the manager' do
      result = query.query
      expect(result).not_to include(manager)
    end
  end

  context 'when user has no manager relationship' do
    let!(:user_without_manager) { create(:user) }
    let!(:other_plan) do
      create(:user_idp_plan, user: user_without_manager, campaign: campaign, active: true)
    end

    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: other_plan,
             created_by: user_without_manager,
             created_at: 30.minutes.ago)
    end

    it 'does not return any manager' do
      result = query.query
      expect(result).not_to include(manager)
      expect(result).to be_empty
    end
  end
end
