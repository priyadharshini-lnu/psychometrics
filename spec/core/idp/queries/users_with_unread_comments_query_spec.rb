# frozen_string_literal: true

require 'rails_helper'

describe Idp::Queries::UsersWithUnreadCommentsQuery do
  let!(:manager) { create(:user, :with_project_membership) }
  let!(:user) { create(:user, manager_id: manager.id) }
  let!(:campaign) { create(:campaign, project: manager.project) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user, campaign: campaign, active: true, status: :pending_approval)
  end

  let(:recent_comments_timeframe) { 1.hour.ago..Time.current }
  let(:query) { described_class.new(campaign, recent_comments_timeframe) }

  context 'when user has unread comments in timeframe' do
    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    it 'returns the user' do
      result = query.query
      expect(result).to include(user)
    end

    it 'returns distinct users even with multiple unread comments' do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 20.minutes.ago)

      result = query.query
      expect(result.count).to eq(1)
      expect(result).to include(user)
    end
  end

  context 'when user has read the comments' do
    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    before do
      comment.update!(read_by_user_ids: [user.id])
    end

    it 'does not return the user' do
      result = query.query
      expect(result).not_to include(user)
    end
  end

  context 'when user created the comment themselves' do
    let!(:self_comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: user,
             created_at: 30.minutes.ago)
    end

    it 'does not return the user' do
      result = query.query
      expect(result).not_to include(user)
    end
  end

  context 'when user has inactive plan' do
    let!(:inactive_plan) do
      create(:user_idp_plan, user: user, campaign: campaign, active: false)
    end

    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: inactive_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    it 'does not return the user' do
      result = query.query
      expect(result).not_to include(user)
    end
  end

  context 'when comment is outside timeframe' do
    let!(:old_comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 2.hours.ago)
    end

    it 'does not return the user' do
      result = query.query
      expect(result).not_to include(user)
    end
  end

  context 'when comment is from different campaign' do
    before do
      user_idp_plan.update!(active: false)

      other_campaign = create(:campaign, project: manager.project)
      other_plan = create(:user_idp_plan, user: user, campaign: other_campaign, active: true)

      create(:user_idp_comment,
             user_idp_plan: other_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    it 'does not return the user' do
      result = query.query
      expect(result).not_to include(user)
    end
  end

  context 'with multiple users in same campaign' do
    let!(:user2) { create(:user, manager_id: manager.id) }
    let!(:user2_plan) do
      create(:user_idp_plan, user: user2, campaign: campaign, active: true)
    end

    let!(:comment1) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    let!(:comment2) do
      create(:user_idp_comment,
             user_idp_plan: user2_plan,
             created_by: manager,
             created_at: 25.minutes.ago)
    end

    it 'returns all users with unread comments' do
      result = query.query
      expect(result).to include(user, user2)
      expect(result.count).to eq(2)
    end

    context 'when one user has read their comment' do
      before do
        comment1.update!(read_by_user_ids: [user.id])
      end

      it 'returns only users with unread comments' do
        result = query.query
        expect(result).to include(user2)
        expect(result).not_to include(user)
        expect(result.count).to eq(1)
      end
    end
  end

  context 'when multiple users have read the same comment' do
    let!(:user2) { create(:user, manager_id: manager.id) }
    let!(:user2_plan) do
      create(:user_idp_plan, user: user2, campaign: campaign, active: true)
    end

    let!(:comment) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    before do
      comment.update!(read_by_user_ids: [user.id, user2.id])
    end

    it 'does not return any users' do
      result = query.query
      expect(result).not_to include(user)
      expect(result).to be_empty
    end
  end

  context 'when user has partially read comments' do
    let!(:comment1) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 30.minutes.ago)
    end

    let!(:comment2) do
      create(:user_idp_comment,
             user_idp_plan: user_idp_plan,
             created_by: manager,
             created_at: 25.minutes.ago)
    end

    before do
      comment1.update!(read_by_user_ids: [user.id])
    end

    it 'returns the user (because they have unread comments)' do
      result = query.query
      expect(result).to include(user)
      expect(result.count).to eq(1)
    end
  end

  context 'when no users meet criteria' do
    it 'returns empty relation' do
      result = query.query
      expect(result).to be_empty
    end
  end
end
