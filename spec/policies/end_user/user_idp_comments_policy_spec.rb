# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserIdpCommentsPolicy do
  let!(:manager) { create(:user, :with_project_membership) }
  let!(:user) { create(:user, manager_id: manager.id, project: manager.project) }
  let!(:another_user) { create(:user, project: manager.project) }
  let!(:campaign) { create(:campaign, project: manager.project) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user, campaign: campaign, active: true, status: :pending_approval)
  end
  let!(:resource) { create(:user_idp_skill) }
  let!(:comment) do
    create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, resource: resource)
  end

  def policy_context(current_user)
    {
      current_user: current_user,
      current_client: current_user.project&.client,
      current_project: current_user.project
    }
  end

  shared_examples 'allows access for user and manager' do |policy_method, record_type|
    context 'when record is the user themselves' do
      subject { described_class.new(policy_context(user), send(record_type)) }

      it 'allows access' do
        expect(subject.public_send(policy_method)).to be_truthy
      end
    end

    context 'when record is the user\'s manager' do
      subject { described_class.new(policy_context(manager), send(record_type)) }

      it 'allows access' do
        expect(subject.public_send(policy_method)).to be_truthy
      end
    end

    context 'when record is another user (not manager)' do
      subject { described_class.new(policy_context(another_user), send(record_type)) }

      it 'denies access' do
        expect(subject.public_send(policy_method)).to be_falsey
      end
    end
  end

  describe 'index?' do
    include_examples 'allows access for user and manager', :index?, :user
  end

  describe 'create?' do
    include_examples 'allows access for user and manager', :create?, :user
  end

  describe 'show?' do
    include_examples 'allows access for user and manager', :show?, :user
  end

  describe 'resolve?' do
    include_examples 'allows access for user and manager', :resolve?, :user
  end

  describe 'unresolve?' do
    include_examples 'allows access for user and manager', :unresolve?, :user
  end

  describe 'update?' do
    context 'when current user is the comment creator' do
      subject { described_class.new(policy_context(user), comment) }

      it 'allows access' do
        expect(subject.update?).to be_truthy
      end
    end

    context 'when current user is the manager but not comment creator' do
      subject { described_class.new(policy_context(manager), comment) }

      it 'denies access' do
        expect(subject.update?).to be_falsey
      end
    end

    context 'when current user is another user' do
      subject { described_class.new(policy_context(another_user), comment) }

      it 'denies access' do
        expect(subject.update?).to be_falsey
      end
    end
  end
end
