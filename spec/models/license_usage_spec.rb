require 'rails_helper'

RSpec.describe LicenseUsage, type: :model do
  let!(:tenancy) { create(:tenancy) }
  let!(:license) { create(:license, client: tenancy, used_number: 0) }

  context 'After commit' do
    subject { build(:license_usage, license: license) }
    it 'Increment `used_number`' do
      expect { subject.increase_license_used_number }.to change { license.reload.used_number }.by(1)
      expect(license.used_number).to eq(1)
    end
  end
end
