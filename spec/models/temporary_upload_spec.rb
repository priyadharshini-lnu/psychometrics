# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TemporaryUpload, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:file_key) }
    it { should validate_presence_of(:filename) }
    it { should validate_presence_of(:content_type) }
    it { should validate_presence_of(:byte_size) }
    it { should validate_numericality_of(:byte_size).is_greater_than(0) }
    it { should validate_presence_of(:service_name) }
    it { should validate_presence_of(:bucket) }
    it { should validate_presence_of(:status) }
  end

  describe 'scopes' do
    describe '.stale' do
      let!(:recent_pending) { create(:temporary_upload, status: :pending, created_at: 1.hour.ago) }
      let!(:stale_pending) { create(:temporary_upload, status: :pending, created_at: 25.hours.ago) }
      let!(:stale_processed) { create(:temporary_upload, status: :processed, created_at: 25.hours.ago) }

      it 'returns only pending uploads older than 24 hours' do
        expect(TemporaryUpload.stale).to contain_exactly(stale_pending)
      end
    end
  end
end
