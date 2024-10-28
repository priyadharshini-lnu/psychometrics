require 'rails_helper'

RSpec.describe ClientPrivacySetting, type: :model do
  let(:client) { create(:tenancy) }
  let(:client_privacy_setting) { build(:client_privacy_setting, client: client) }

  describe 'validations' do
    it 'is valid with valid attributes' do
      expect(client_privacy_setting).to be_valid
    end

    it 'is not valid without a client_id' do
      client_privacy_setting.client = nil
      expect(client_privacy_setting).not_to be_valid
      expect(client_privacy_setting.errors[:client]).to include('can\'t be blank')
    end
  end
end
