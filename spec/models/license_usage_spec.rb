require 'rails_helper'

RSpec.describe LicenseUsage, type: :model do
  let!(:client) { create(:client, no_license: true) }
  let!(:license) { create(:license, client: client, type: :users, used_number: 0) }

  context 'After commit' do
    it 'Increment `used_number`' do
      LicenseUsage.create(license: license)
      expect(license.used_number).to eq(1)
    end

    it 'If license is unlimited
        Then not increment `used_number`' do
      license.update_attribute(:unlimited, true)
      LicenseUsage.create(license: license)
      expect(license.used_number).to be_zero
    end
  end
end
