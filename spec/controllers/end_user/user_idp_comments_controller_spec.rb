# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserIdpCommentsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:manager) { create(:user, :with_project_membership) }
  let!(:user) { create(:user, manager_id: manager.id, project: manager.project) }
  let!(:another_user) { create(:user, project: manager.project) }
  let!(:campaign) { create(:campaign, project: manager.project) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user, campaign: campaign, active: true, status: :pending_approval)
  end
  let!(:campaign_user) { create(:campaign_user, user: user, campaign: campaign, active: true) }
  let!(:resource) { create(:user_idp_skill) }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET #index' do
    let!(:comment1) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resource: resource)
    end
    let!(:comment2) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: manager, resource: resource)
    end

    it 'returns paginated comments and meta count, marks comments as read' do
      get :index, params: { user_id: user.id, page: 1, page_size: 2 }
      expect(response).to have_http_status(:ok)

      parsed = response.parsed_body
      expect(parsed['data'].size).to eq(2)
      expect(parsed['meta']).to eq({ 'count' => 2 })

      expected_comments = Panko::ArraySerializer.new(
        [comment1, comment2],
        each_serializer: EndUser::UserIdpCommentSerializer,
        context: { current_user: user }
      ).to_a

      expect(parsed['data']).to eq(expected_comments.as_json)

      expect(comment1.reload.read_by_user_ids).to include(user.id)
      expect(comment2.reload.read_by_user_ids).to include(user.id)
    end

    it 'does not update read_by_user_ids on duplicate reads' do
      get :index, params: { user_id: user.id, page: 1, page_size: 2 }

      initial_read_arrays = [comment1.reload.read_by_user_ids, comment2.reload.read_by_user_ids]

      expect(comment1.reload.read_by_user_ids).to include(user.id)
      expect(comment2.reload.read_by_user_ids).to include(user.id)

      Timecop.travel(5.minutes.from_now) do
        get :index, params: { user_id: user.id, page: 1, page_size: 2 }
      end

      final_read_arrays = [comment1.reload.read_by_user_ids, comment2.reload.read_by_user_ids]

      expect(final_read_arrays).to eq(initial_read_arrays)
    end

    it 'paginates correctly' do
      3.times { create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resource: resource) }
      get :index, params: { user_id: user.id, page: 1, page_size: 2 }

      parsed = response.parsed_body
      expect(parsed['data'].size).to eq(2)
      expect(parsed['meta']['count']).to eq(5)
    end

    context 'with ransack filtering' do
      let!(:resource2) { create(:user_idp_skill) }
      let!(:resource3) { create(:user_idp_skill) }
      let!(:comment_with_resource2) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resource: resource2)
      end
      let!(:comment_with_different_type) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resource: resource3)
      end

      it 'filters comments by both resource_type and resource_id' do
        get :index, params: {
          user_id: user.id,
          q: {
            resource_type_eq: 'UserIdpSkill',
            resource_id_eq: resource2.id
          }
        }

        expect(response).to have_http_status(:ok)
        parsed = response.parsed_body

        expect(parsed['data'].size).to eq(1)
        expect(parsed['meta']['count']).to eq(1)

        comment_data = parsed['data'].first
        expect(comment_data['resource_type']).to eq('UserIdpSkill')
        expect(comment_data['resource_id']).to eq(resource2.id)

        expect(comment_with_resource2.reload.read_by_user_ids).to include(user.id)
      end

      it 'ignores ransack params when q param is not present' do
        get :index, params: { user_id: user.id }

        expect(response).to have_http_status(:ok)
        parsed = response.parsed_body

        expect(parsed['data'].size).to eq(4)
        expect(parsed['meta']['count']).to eq(4)
      end

      context 'when resolved_eq params is passed' do
        before do
          comment_with_resource2.resolve!(user)
        end

        it 'returns resolved comments if resolved_eq true is passed' do
          get :index, params: {
            user_id: user.id,
            q: {
              resolved_eq: true
            }
          }

          expect(response).to have_http_status(:ok)
          parsed = response.parsed_body

          expect(parsed['data'].size).to eq(1)
          expect(parsed['meta']['count']).to eq(1)

          comment_data = parsed['data'].first

          expect(comment_data['id']).to eq(comment_with_resource2.id)
        end
      end
    end

    context 'when load_replies is true' do
      let!(:reply1) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: comment1)
      end
      let!(:reply2) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: manager, parent: comment1)
      end

      it 'loads replies for each comment' do
        get :index, params: { user_id: user.id, page: 1, load_replies: 'true' }
        expect(response).to have_http_status(:ok)
        parsed = response.parsed_body
        expect(parsed['data'].size).to eq(2)

        comment1_data = parsed['data'].find { |comment| comment['id'] == comment1.id }
        expect(comment1_data).not_to be_nil

        expect(comment1_data['replies'].size).to eq(2)
        expect(comment1_data['replies'].map { |r| r['id'] }).to include(reply1.id, reply2.id)
        expect(comment1_data['replies'].map { |r| r['created_by']['id'] }).to include(user.id, manager.id)
        expect(comment1_data['replies'].map { |r| r['content'] }).to include(reply1.content, reply2.content)

        expect(comment1.reload.read_by_user_ids).to include(user.id)
        expect(reply1.reload.read_by_user_ids).to include(user.id)
        expect(reply2.reload.read_by_user_ids).to include(user.id)
      end
    end

    context 'when unread_by_user is true' do
      let!(:another_unread_comment_by_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: manager)
      end
      let!(:read_comment_by_user) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: manager, read_by_user_ids: [user.id])
      end

      it 'loads comments which are unread by the logged in user' do
        get :index, params: { user_id: user.id, page: 1, unread_by_user: 'true' }
        expect(response).to have_http_status(:ok)
        parsed = response.parsed_body
        expect(parsed['data'].size).to eq(2)

        comment1_data = parsed['data'].find { |comment| comment['id'] == comment2.id }
        expect(comment1_data).not_to be_nil
      end
    end
  end

  describe 'POST #create' do
    let(:comment_attrs) do
      {
        content: 'This is a new comment',
        resource_type: 'UserIdpSkill',
        resource_id: resource.id
      }
    end

    it 'creates a new comment for the user idp plan' do
      expect do
        post :create, params: {
          user_id: user.id,
          user_idp_comment: comment_attrs
        }
      end.to change { user_idp_plan.user_idp_comments.count }.by(1)
      expect(response).to have_http_status(:created)
      comment = user_idp_plan.user_idp_comments.last
      expect(comment.content).to eq('This is a new comment')
      expect(comment.resource).to eq(resource)
      expect(comment.created_by).to eq(user)
    end

    context 'allows adding reply' do
      let!(:parent_comment) do
        create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resource: resource)
      end
      let!(:reply_attrs) do
        {
          parent_id: parent_comment.id,
          content: 'This is a reply',
          resource_type: 'UserIdpSkill',
          resource_id: resource.id
        }
      end

      it 'it creates a reply to an existing comment' do
        expect do
          post :create, params: {
            user_id: user.id,
            user_idp_comment: reply_attrs
          }
        end.to change { user_idp_plan.user_idp_comments.count }.by(1)

        expect(response).to have_http_status(:created)
        reply = user_idp_plan.user_idp_comments.last
        expect(reply.content).to eq('This is a reply')
        expect(reply.resource).to eq(resource)
        expect(reply.created_by).to eq(user)
        expect(reply.parent).to eq(parent_comment)
      end
    end
  end

  describe 'GET #show' do
    let!(:comment) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resource: resource)
    end
    let!(:reply) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: manager,
            resource: resource, parent: comment)
    end

    it 'returns the comment with replies and marks as read' do
      expected_comment = EndUser::UserIdpCommentSerializer.new(
        context: { current_user: user, load_replies: true }
      ).serialize(
        comment.reload
      )
      get :show, params: { user_id: user.id, id: comment.id }

      expect(response).to have_http_status(:ok)
      parsed = response.parsed_body

      expect(parsed['data']).to eq(expected_comment.as_json)

      expect(comment.reload.read_by_user_ids).to include(user.id)
      expect(reply.reload.read_by_user_ids).to include(user.id)
    end
  end

  describe 'PATCH #resolve' do
    let!(:comment) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user,
            resource: resource)
    end
    it 'resolves the comment successfully' do
      expect(comment).not_to be_resolved

      patch :resolve, params: { user_id: user.id, id: comment.id }

      expect(response).to have_http_status(:ok)
      parsed = response.parsed_body

      comment.reload
      expect(comment).to be_resolved
      expect(comment.resolved_by).to eq(user)

      expected_comment = EndUser::UserIdpCommentSerializer.new(
        context: { current_user: user }
      ).serialize(comment)
      expect(parsed['data']).to eq(expected_comment.as_json)
    end
  end

  describe 'PATCH #unresolve' do
    let!(:resolved_comment) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user,
            resource: resource, resolved_by: manager, resolved_at: Time.current)
    end
    it 'unresolves the comment successfully' do
      expect(resolved_comment).to be_resolved

      patch :unresolve, params: { user_id: user.id, id: resolved_comment.id }

      expect(response).to have_http_status(:ok)
      parsed = response.parsed_body

      resolved_comment.reload
      expect(resolved_comment).not_to be_resolved
      expect(resolved_comment.resolved_by).to be_nil

      expected_comment = EndUser::UserIdpCommentSerializer.new(
        context: { current_user: user }
      ).serialize(resolved_comment)
      expect(parsed['data']).to eq(expected_comment.as_json)
    end
  end

  describe 'PATCH #update' do
    let!(:comment) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user,
            resource: resource, content: 'Original content')
    end
    it 'updates the comment content and marks as edited' do
      new_content = 'Updated content'

      patch :update, params: {
        user_id: user.id,
        id: comment.id,
        user_idp_comment: { content: new_content }
      }

      expect(response).to have_http_status(:ok)
      parsed = response.parsed_body

      comment.reload
      expect(comment.content).to eq(new_content)
      expect(comment.edited).to be true

      expected_comment = EndUser::UserIdpCommentSerializer.new(
        context: { current_user: user }
      ).serialize(comment)
      expect(parsed['data']).to eq(expected_comment.as_json)
    end
  end
end
