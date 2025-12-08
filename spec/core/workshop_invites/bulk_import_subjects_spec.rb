# frozen_string_literal: true

require 'rails_helper'

describe WorkshopInvites::BulkImportSubjects do
  let!(:campaign) { create(:campaign) }
  let!(:assessment_group) { create(:campaign_assessment_group, campaign: campaign) }
  let!(:workshop_invite) { create(:workshop_invite, campaign: campaign, campaign_assessment_group: assessment_group) }
  let!(:user1) { create(:user, email: 'user1@test.test') }
  let!(:user2) { create(:user, email: 'user2@test.test') }
  let!(:campaign_user1) { create(:campaign_user, campaign: campaign, user: user1) }
  let!(:campaign_user2) { create(:campaign_user, campaign: campaign, user: user2) }
  let!(:current_user) { create(:user) }

  describe '.call' do
    let(:file) { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/subjects.csv'), 'text/csv') }

    before do
      allow(AdminJob).to receive(:call)
    end

    context 'when CSV is valid and no conflicts exist' do
      before do
        allow(CsvFileParser).to receive(:call!).with(file, headers: :first_row).and_return([
          { 'email' => 'user1@test.test' },
          { 'email' => 'user2@test.test' }
        ])
      end

      it 'successfully processes and queues job' do
        expect(AdminJob).to receive(:call).with(
          :bulk_create_workshop_invites,
          { workshop_invite_id: workshop_invite.id, subjects: [{ user_id: user1.id }, { user_id: user2.id }] },
          current_user
        )

        result = described_class.call!(campaign.id, file, workshop_invite.id, current_user)

        expect(result[:validation_errors]).to be_empty
      end
    end

    context 'when users are not in campaign' do
      before do
        allow(CsvFileParser).to receive(:call!).with(file, headers: :first_row).and_return([
          { 'email' => 'nonexistent@test.test' }
        ])
      end

      it 'returns validation errors for non-existent users' do
        result = described_class.call!(campaign.id, file, workshop_invite.id, current_user)

        expect(result[:validation_errors].size).to eq(1)
        error = result[:validation_errors].first
        expect(error[:message]).to include('nonexistent@test.test')
        expect(AdminJob).not_to have_received(:call)
      end
    end

    context 'when CSV is empty' do
      before do
        allow(CsvFileParser).to receive(:call!).with(file, headers: :first_row).and_return([])
      end

      it 'returns empty CSV error' do
        result = described_class.call!(campaign.id, file, workshop_invite.id, current_user)

        expect(result[:validation_errors].size).to eq(1)
        expect(result[:validation_errors].first[:message]).to be_present
        expect(AdminJob).not_to have_received(:call)
      end
    end

    context 'when CSV has invalid headers' do
      before do
        allow(CsvFileParser).to receive(:call!).with(file, headers: :first_row).and_return([
          { 'invalid_header' => 'some_value' }
        ])
      end

      it 'returns invalid header error' do
        result = described_class.call!(campaign.id, file, workshop_invite.id, current_user)

        expect(result[:validation_errors].size).to eq(1)
        expect(result[:validation_errors].first[:message]).to be_present
        expect(AdminJob).not_to have_received(:call)
      end
    end
  end
end
