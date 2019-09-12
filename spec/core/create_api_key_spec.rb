# frozen_string_literal: true

require 'rails_helper'

describe CreateApiKey do
  let!(:membership) { create(:client_admin_membership) }
  let(:user) { membership.user }

  describe 'broadcast ok' do
    subject { ApiKey.last }
    it 'creates one api_key' do
      expect { described_class.call(user) }.to change { ApiKey.count }.from(0).to(1)
    end

    it 'creates correct data' do
      described_class.call(user)
      expect(subject.user).to eq(user)
      expect(subject.key).not_to be_nil
      expect(subject.token).not_to be_nil
      expect(subject.disabled).not_to be_nil
      expect(subject.disabled).to be_falsy
    end
  end
end
