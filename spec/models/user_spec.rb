# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  it { should have_many(:api_keys).inverse_of(:user) }
  it { should have_many(:users_assessments).inverse_of(:user) }
  it { should have_many(:assessments).through(:users_assessments) }
  it { should have_many(:users_reports).inverse_of(:user) }

  describe '#send_two_factor_authentication_code' do
    it 'enqueues sending the two factor code' do
      allow(SendTwoFactorCodeJob).to receive(:perform_later)
      user = create(:user)

      user.send_two_factor_authentication_code('123456')

      expect(SendTwoFactorCodeJob).to have_received(:perform_later)
    end
  end
end
