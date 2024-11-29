# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OracleAnalytics::ClearInactiveUsersJob, type: :job do
  describe '#perform' do
    let(:config) { Settings.oac }
    let!(:user) { create(:user) }
    let!(:second_user) { create(:user) }
    let!(:inactive_oracle_credential) do
      create(:oracle_credential, user: second_user, last_accessed_at: 31.days.ago)
    end

    let!(:active_oracle_credential) do
      create(:oracle_credential, user: user, last_accessed_at: Time.current)
    end

    before do
      allow(OracleAnalytics::DeleteUser).to receive(:call!)
    end

    it 'deletes inactive users' do
      expect(OracleAnalytics::DeleteUser).to receive(:call!).with(second_user)

      described_class.perform_now
    end

    it 'does not delete active users' do
      expect(OracleAnalytics::DeleteUser).not_to receive(:call!).with(user)

      described_class.perform_now
    end
  end
end
