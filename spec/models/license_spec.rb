require 'rails_helper'

RSpec.describe License, type: :model do
  let!(:client) { create(:client, no_license: true) }
  let!(:license) { create(:license, client: client) }

  it 'If license became unlimited
      Then we set license counters to zero' do
    license.update_attributes({ number: 10, overuse_number: 5, used_number: 15 })

    expect(license.number).to eq(10)
    expect(license.overuse_number).to eq(5)
    expect(license.used_number).to eq(15)

    license.update_attribute(:unlimited, true)

    expect(license.number).to be_zero
    expect(license.overuse_number).to be_zero
    expect(license.used_number).to be_zero
  end

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
        if Client has unlimited licenses' do
      license.update_attributes({ unlimited: true })
      expect(license.enough_licenses?).to be_truthy
    end

    it 'returns true
        if Client has enough licenses' do
      license.update_attributes({ number: 10, used_number: 5 })
      expect(license.enough_licenses?).to be_truthy
    end
  end
end
