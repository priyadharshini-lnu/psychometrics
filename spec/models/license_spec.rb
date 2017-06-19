require 'rails_helper'

RSpec.describe License, type: :model do
  let!(:tenancy) { create(:tenancy, no_license: true) }
  let!(:license) { create(:license, client: tenancy) }

  context '#used_overuse_number' do
    it 'returns zero' do
      expect(license.used_overuse_number).to be_zero
    end

    it 'returns zero
        if used number license less then given license' do
      license.update_attributes({ number: 10, used_number: 5 })
      expect(license.used_overuse_number).to be_zero
    end

    it 'returns greater than zero
        if used number license have been over use' do
      license.update_attributes({ number: 10, used_number: 15 })
      expect(license.used_overuse_number).to eq(5)
    end
  end

  context '#enough_licenses?' do
    it 'returns false' do
      license.update_attributes({ number: 0 })
      expect(license.enough_licenses?).to be_falsey
    end

    it 'returns false
        if Client has no enough licenses' do
      license.update_attributes({ number: 10, overuse_number: 5, used_number: 15 })
      expect(license.enough_licenses?).to be_falsey
    end

    it 'returns true
        if Client has enough licenses' do
      license.update_attributes({ number: 10, used_number: 5 })
      expect(license.enough_licenses?).to be_truthy
    end
  end
end
