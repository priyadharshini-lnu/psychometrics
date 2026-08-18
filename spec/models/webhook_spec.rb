# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhook, type: :model do
  subject { build(:webhook) }

  describe 'associations' do
    it { is_expected.to belong_to(:project) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_presence_of(:auth_type) }
    it { is_expected.to validate_presence_of(:url) }

    it 'is invalid with a bad url' do
      webhook = build(:webhook, url: 'not a url')
      expect(webhook).not_to be_valid
      expect(webhook.errors[:url]).to include('is not a valid URL')
    end

    it { is_expected.to allow_value('valid-header_123').for(:api_key_header) }
    it { is_expected.not_to allow_value('invalid header!').for(:api_key_header) }

    context 'when auth_type is oauth' do
      subject { build(:webhook, auth_type: 'oauth') }

      it { is_expected.to validate_presence_of(:oauth_grant_type) }
      it { is_expected.to validate_presence_of(:oauth_token_url) }
      it { is_expected.to validate_presence_of(:oauth_client_id) }
      it { is_expected.to validate_presence_of(:oauth_client_secret) }
      it { is_expected.to allow_value(nil, '').for(:oauth_scope) }
    end
  end

  describe 'enums' do
    it do
      is_expected.to define_enum_for(:auth_type).
        with_values({ no_auth: 0, basic_auth: 1, api_key_auth: 2, oauth: 3 })
    end
  end

  describe 'scopes' do
    let!(:active_webhook) { create(:webhook, active: true, url: 'http://example.com/active') }
    let!(:inactive_webhook) { create(:webhook, active: false, url: 'http://example.com/inactive') }
    let!(:project1) { create(:project) }
    let!(:project2) { create(:project) }
    let!(:webhook1) { create(:webhook, project_id: project1.id, description: 'first webhook', url: 'http://example.com/first', active: false) }
    let!(:webhook2) { create(:webhook, project_id: project2.id, url: 'http://example.com/find_me', description: 'find me', active: false) }

    it 'returns only active webhooks for the active scope' do
      expect(described_class.active).to contain_exactly(active_webhook)
    end

    it 'returns only webhooks for a given project for the webhooks_of scope' do
      expect(described_class.webhooks_of(project1.id)).to contain_exactly(webhook1)
    end

    it 'returns webhooks matching the query for the filterable_fields scope' do
      expect(described_class.filterable_fields('first')).to contain_exactly(webhook1)
      expect(described_class.filterable_fields('find me')).to contain_exactly(webhook2)
    end
  end

  describe 'callbacks' do
    describe '#clear_assessment_ids_if_needed' do
      let(:assessment_ids) { [1, 2, 3] }
      let!(:webhook) { create(:webhook, assessment_ids: assessment_ids) }

      context "when topics do not include 'assessment_raw_response'" do
        before do
          create(:topic, subscription: webhook, name: 'assessment_started')
        end

        it 'clears assessment_ids on update' do
          webhook.update(description: 'A new description')
          expect(webhook.reload.assessment_ids).to be_empty
        end
      end

      context "when topics include 'assessment_raw_response'" do
        before do
          create(:topic, subscription: webhook, name: 'assessment_raw_response')
        end

        it 'does not clear assessment_ids on update' do
          webhook.update(description: 'A new description')
          expect(webhook.reload.assessment_ids).to eq(assessment_ids)
        end
      end

      context "when topics include 'assessment_raw_response' among others" do
        before do
          create(:topic, subscription: webhook, name: 'assessment_started')
          create(:topic, subscription: webhook, name: 'assessment_raw_response')
        end

        it 'does not clear assessment_ids on update' do
          webhook.update(description: 'A new description')
          expect(webhook.reload.assessment_ids).to eq(assessment_ids)
        end
      end

      context 'when there are no topics' do
        it 'clears assessment_ids on update' do
          webhook.update(description: 'A new description')
          expect(webhook.reload.assessment_ids).to be_empty
        end
      end
    end
  end
end
