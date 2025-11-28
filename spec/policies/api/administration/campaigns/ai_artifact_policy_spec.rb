# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::Campaigns::AIArtifactPolicy do
  let(:permitted_actions) do
    %i[index? show? create? update? destroy? export? import? generate? test_generate? bulk_generate?]
  end

  let(:campaign) do
    create(:campaign).tap do |record|
      project_feature = record.project.project_feature ||
                        record.project.create_project_feature!
      project_feature.update!(ai_assistants: true)
    end
  end

  describe 'for superadmin' do
    subject { described_class.new(superadmin, campaign, campaign_id: campaign.id) }

    let(:superadmin) { create(:superadmin) }

    it 'allows all actions' do
      permitted_actions.each do |permission|
        expect(subject.public_send(permission)).to be_truthy
      end
    end
  end

  describe 'for campaign admin with permissions' do
    subject { described_class.new(campaign_admin, campaign, campaign_id: campaign.id) }

    let(:campaign_admin) { create(:user) }
    let!(:membership) { create(:campaign_admin_membership, user: campaign_admin, campaign: campaign) }

    it 'allows all actions' do
      permitted_actions.each do |permission|
        expect(subject.public_send(permission)).to be_truthy
      end
    end

    context 'when ai artifact grants are revoked' do
      before do
        updated_data = membership.grants.data.deep_dup
        updated_data.delete('ai_artifacts')
        membership.grants.update!(data: updated_data)
      end

      it 'denies actions' do
        permitted_actions.each do |permission|
          expect(subject.public_send(permission)).to be_falsey
        end
      end
    end
  end

  describe 'for regular user' do
    subject { described_class.new(user, campaign, campaign_id: campaign.id) }

    let(:user) { create(:user) }

    it 'denies all actions' do
      permitted_actions.each do |permission|
        expect(subject.public_send(permission)).to be_falsey
      end
    end
  end

  describe 'when ai assistants feature is disabled' do
    let(:disabled_campaign) { create(:campaign) }
    let(:superadmin) { create(:superadmin) }
    subject { described_class.new(superadmin, disabled_campaign, campaign_id: disabled_campaign.id) }

    it 'denies all actions' do
      permitted_actions.each do |permission|
        expect(subject.public_send(permission)).to be_falsey
      end
    end
  end
end
