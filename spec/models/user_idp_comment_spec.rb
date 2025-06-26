# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpComment, type: :model do
  let!(:user) { create(:user) }
  let!(:another_user) { create(:user) }
  let!(:manager) { create(:user) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user) }

  describe 'validations' do
    subject { build(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user) }

    it { should validate_presence_of(:content) }

    context 'cannot_reply_to_reply validation' do
      let!(:parent_comment) { create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user) }
      let!(:reply_comment) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: parent_comment)
      end

      it 'prevents replies to replies (nested replies)' do
        comment = build(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: reply_comment)
        expect(comment).not_to be_valid
        expect(comment.errors[:parent]).to include(I18n.t('activerecord.errors.models.user_idp_comment.reply_to_reply'))
      end
    end
  end

  describe 'scopes' do
    describe '.top_level' do
      let!(:top_level_comment_by_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: nil)
      end
      let!(:top_level_comment_by_another_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user, parent: nil)
      end
      let!(:reply_comment_by_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: top_level_comment_by_user)
      end
      let!(:reply_comment_by_another_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user,
parent: top_level_comment_by_user)
      end
      it 'returns only comments without a parent' do
        results = described_class.top_level
        expect(results).to include(top_level_comment_by_user, top_level_comment_by_another_user)
        expect(results).not_to include(reply_comment_by_user, reply_comment_by_another_user)
      end
    end

    describe '.unread_by_user' do
      let!(:top_level_comment_by_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: nil)
      end
      let!(:top_level_comment_by_another_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user, parent: nil)
      end
      let!(:reply_comment_by_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: top_level_comment_by_user)
      end
      let!(:reply_comment_by_another_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user,
parent: top_level_comment_by_user)
      end
      let!(:reply_comment2_by_another_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user,
parent: top_level_comment_by_user)
      end

      before do
        reply_comment_by_another_user.update!(read_by_user_ids: [user.id])
      end

      it 'returns comment and replies not read by the user and not created by the user' do
        results = described_class.unread_by_user(user)
        expect(results).to include(top_level_comment_by_another_user, reply_comment2_by_another_user)
        expect(results).not_to include(reply_comment_by_another_user, reply_comment_by_user)
      end
    end

    describe '.unread_or_unread_replies_for_user' do
      let!(:comment_with_unread_reply) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user)
      end
      let!(:unread_reply) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: manager, parent: comment_with_unread_reply)
      end
      let!(:comment_with_unread_reply2) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user)
      end
      let!(:unread_reply2) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: manager, parent: comment_with_unread_reply2)
      end
      let!(:read_comment_by_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user, read_by_user_ids: [user.id])
      end

      context 'when comment and replies both are unread' do
        it 'returns comments that are unread by the user and not replies' do
          results = described_class.unread_or_unread_replies_for_user(user)
          expect(results.count).to eq(2)
          expect(results).to include(comment_with_unread_reply, comment_with_unread_reply2)
        end
      end

      context 'when comments are read and replies are unread' do
        before do
          comment_with_unread_reply2.update!(read_by_user_ids: [user.id])
          comment_with_unread_reply.update!(read_by_user_ids: [user.id])
        end

        it 'returns parent comments with unread replies' do
          results = described_class.unread_or_unread_replies_for_user(user)
          expect(results.count).to eq(2)
          expect(results).to include(comment_with_unread_reply2, comment_with_unread_reply)
        end
      end
    end
  end

  describe 'ransacker :resolved' do
    let!(:resolved_comment) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resolved_by: manager,
     resolved_at: Time.current)
    end
    let!(:unresolved_comment) { create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user) }

    it 'finds resolved comments' do
      results = described_class.ransack(resolved_eq: true).result
      expect(results).to include(resolved_comment)
      expect(results).not_to include(unresolved_comment)
    end

    it 'finds unresolved comments' do
      results = described_class.ransack(resolved_eq: false).result
      expect(results).to include(unresolved_comment)
      expect(results).not_to include(resolved_comment)
    end

    it 'finds all comments when no filter is applied' do
      results = described_class.ransack({}).result
      expect(results).to include(resolved_comment)
      expect(results).to include(unresolved_comment)
    end
  end

  describe 'ransack filters' do
    it 'applies custom ordering when specified' do
      older_comment = create(:user_idp_comment, created_at: 2.days.ago)
      newer_comment = create(:user_idp_comment, created_at: 1.day.ago)

      results = described_class.ransack(s: 'created_at asc').result
      expect(results.first).to eq(older_comment)
      expect(results.last).to eq(newer_comment)

      results = described_class.ransack(s: 'created_at desc').result
      expect(results.first).to eq(newer_comment)
      expect(results.last).to eq(older_comment)
    end
  end

  describe 'counter cache' do
    let!(:parent_comment) { create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user) }

    it 'updates replies_count when replies are added' do
      expect do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user, parent: parent_comment)
      end.
        to change { parent_comment.reload.replies_count }.from(0).to(1)
    end

    it 'updates replies_count when replies are destroyed' do
      reply = create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: another_user, parent: parent_comment)
      parent_comment.reload

      expect { reply.destroy }.
        to change { parent_comment.reload.replies_count }.from(1).to(0)
    end
  end
end
