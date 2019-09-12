# frozen_string_literal: true

require 'rails_helper'

RSpec.describe License, type: :model do
  let!(:tenancy) { create(:tenancy) }
  let!(:license) { create(:license, client: tenancy) }

  context 'Relations' do
    it { should belong_to(:client).counter_cache(true) }
    it { should belong_to(:report_family) }
    it { should have_many(:license_usages) }
  end

  context 'Validations' do
    it { should validate_presence_of(:client) }
    it { should validate_presence_of(:start_date) }
    it { should validate_presence_of(:end_date) }
    it { should validate_numericality_of(:overuse_number).is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:used_number).is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:number).is_greater_than_or_equal_to(1) }
    it do
      allow(subject).to receive(:new_record?).and_return(false)
      should validate_numericality_of(:number).is_greater_than_or_equal_to(subject.used_number)
    end
    it { should validate_presence_of(:report_family_id) }
    context '#license_expire_validation' do
      let(:license) { described_class.new(start_date: Date.today) }
      subject { license.send(:license_expire_validation) }
      it do
        license.end_date = 1.day.ago
        expect(license.errors).to receive(:add).with(:end_date, :invalid)
        subject
      end

      it do
        license.end_date = Date.today
        expect(license.errors).to receive(:add).with(:end_date, :invalid)
        subject
      end

      it do
        license.end_date = 1.day.since
        expect(license.errors).not_to receive(:add).with(:end_date, :invalid)
        subject
      end
    end
  end

  context '#in_overuse?' do
    subject { described_class.new }

    it do
      allow(subject).to receive(:used_overuse_number).and_return(1)
      expect(subject.in_overuse?).to be_truthy
    end

    it do
      allow(subject).to receive(:used_overuse_number).and_return(0)
      expect(subject.in_overuse?).to be_falsey
    end
  end

  context '#set_licenses_to_zero' do
    subject { described_class.new }
    after { subject.set_licenses_to_zero }

    it { is_expected.to receive(:number=).with(0) }
    it { is_expected.to receive(:overuse_number=).with(0) }
    it { is_expected.to receive(:used_number=).with(0) }
  end

  context '#used_overuse_number' do
    it 'returns zero' do
      expect(license.used_overuse_number).to be_zero
    end

    it 'returns zero
        if used number license less then given license' do
      license.update_attributes(number: 10, used_number: 5)
      expect(license.used_overuse_number).to be_zero
    end

    it 'returns greater than zero
        if used number license have been over use' do
      license.update_attributes(number: 10, used_number: 15)
      expect(license.used_overuse_number).to eq(5)
    end
  end

  context '#enough_licenses?' do
    it 'returns false' do
      license.update_attributes(number: 0)
      expect(license.enough_licenses?).to be_falsey
    end

    it 'returns false
        if Client has no enough licenses' do
      license.update_attributes(number: 10, overuse_number: 5, used_number: 15)
      expect(license.enough_licenses?).to be_falsey
    end

    it 'returns true
        if Client has enough licenses' do
      license.update_attributes(number: 10, used_number: 5)
      expect(license.enough_licenses?).to be_truthy
    end
  end
end
