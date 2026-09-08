# frozen_string_literal: true

require 'rails_helper'

RSpec.describe License, type: :model do
  let!(:tenancy) { create(:tenancy) }
  let!(:license) { create(:license, client: tenancy) }
  let(:owner_mismatch_message) do
    I18n.t('admin.owner_resource_mismatch',
           child_resource: I18n.t('admin.owner_resource_client'),
           parent_resource: I18n.t('admin.owner_resource_report_bundle'))
  end

  context 'Relations' do
    # TODO: Remove explicit syntax once these issues are fixed in the gem:
    # https://github.com/thoughtbot/shoulda-matchers/issues/1670,
    # https://github.com/thoughtbot/shoulda-matchers/issues/1638
    it { should belong_to(:client).counter_cache({ column: 'licenses_count' }) }
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

    it 'used_number should be in limit' do
      license.number = 5
      license.overuse_number = 5
      license.used_number = 8
      expect(license.valid?).to eq(true)

      license.used_number = 11
      expect(license.valid?).to eq(false)
      expect(license.errors[:used_number]).to include(
        "License used can't be more than the sum of license allocated and overuse limit."
      )
    end

    it { should validate_presence_of(:report_family_id) }
    context '#license_expire_validation' do
      let(:license) { described_class.new(start_date: Time.zone.today) }
      subject { license.send(:license_expire_validation) }
      it do
        license.end_date = 1.day.ago
        expect(license.errors).to receive(:add).with(:end_date, :invalid)
        subject
      end

      it do
        license.end_date = Time.zone.today
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
      license.update(number: 10, used_number: 5)
      expect(license.used_overuse_number).to be_zero
    end

    it 'returns greater than zero
        if used number license have been over use' do
      license.update(number: 10, used_number: 15)
      expect(license.used_overuse_number).to eq(5)
    end
  end

  context '#enough_licenses?' do
    it 'returns false' do
      license.update(number: 0)
      expect(license.enough_licenses?).to be_falsey
    end

    it 'returns false
        if Client has no enough licenses' do
      license.update(number: 10, overuse_number: 5, used_number: 15)
      expect(license.enough_licenses?).to be_falsey
    end

    it 'returns true
        if Client has enough licenses' do
      license.update(number: 10, used_number: 5)
      expect(license.enough_licenses?).to be_truthy
    end
  end

  describe 'owner compatibility with report bundle owner' do
    let(:report_family_owner) { create(:tenancy) }
    let(:other_client) { create(:tenancy) }
    let(:report_family) { create(:report_family, tenant: report_family_owner) }

    it 'is invalid when license client is incompatible with report bundle owner' do
      license = build(:license, client: other_client, report_family: report_family)

      expect(license).not_to be_valid
      expect(license.errors[:report_family]).to include(
        owner_mismatch_message
      )
    end

    it 'is valid when report bundle owner is nil' do
      report_family = create(:report_family, tenant: nil)
      license = build(:license, client: other_client, report_family: report_family)

      expect(license).to be_valid
    end

    it 'is valid for non-common license type even when owner is incompatible' do
      license = build(:license, client: other_client, report_family: report_family, type: :threesixty)

      expect(license).to be_valid
    end

    it 'is invalid when updating client to an incompatible owner' do
      license = create(:license, client: report_family_owner, report_family: report_family)

      result = license.update(client: other_client)

      expect(result).to be(false)
      expect(license.errors[:report_family]).to include(
        owner_mismatch_message
      )
    end
  end

  describe 'uat_usage_limit' do
    let(:report_family) { create(:report_family) }
    let(:user_counted_usage_limit_ceiling) { License::DEFAULT_UAT_USAGE_LIMIT_CEILING }
    let(:proctoring_usage_limit_ceiling) { License::UAT_USAGE_LIMIT_CEILINGS.fetch('proctoring') }

    it 'defaults to zero' do
      expect(create(:license).uat_usage_limit).to eq(0)
    end

    it 'allows up to the ceiling for user-counted licenses' do
      license = build(:license, type: :common, report_family: report_family,
                                uat_usage_limit: user_counted_usage_limit_ceiling)

      expect(license).to be_valid
    end

    it 'rejects more than the ceiling for user-counted licenses' do
      license = build(:license, type: :common, report_family: report_family,
                                uat_usage_limit: user_counted_usage_limit_ceiling + 1)

      expect(license).not_to be_valid
      expect(license.errors[:uat_usage_limit]).to be_present
    end

    it 'allows up to the ceiling for proctoring licenses, which are counted in credits' do
      license = build(:proctoring_license, uat_usage_limit: proctoring_usage_limit_ceiling)

      expect(license.tap(&:valid?).errors[:uat_usage_limit]).to be_empty
    end

    it 'rejects more than the ceiling for proctoring licenses' do
      license = build(:proctoring_license, uat_usage_limit: proctoring_usage_limit_ceiling + 1)

      expect(license).not_to be_valid
      expect(license.errors[:uat_usage_limit]).to be_present
    end

    it 'rejects a negative limit' do
      license = build(:license, report_family: report_family, uat_usage_limit: -1)

      expect(license).not_to be_valid
    end
  end

  describe '#uat_used_number' do
    it 'counts flagged usage rows and ignores billable ones' do
      license = create(:license, uat_usage_limit: 10)
      create(:license_usage, license: license, client: license.client, is_uat: true)
      create(:license_usage, license: license, client: license.client, is_uat: false)

      expect(license.uat_used_number).to eq(1)
    end

    it 'counts each UAT campaign usage row' do
      license = create(:license, uat_usage_limit: 10)
      create_list(:license_usage, 2, license: license, client: license.client, is_uat: true)

      expect(license.uat_used_number).to eq(2)
    end
  end

  describe '#uat_used_number for proctoring' do
    it 'sums the debited credits rather than counting rows' do
      license = create(:proctoring_license, uat_usage_limit: 300)
      create(:license_usage, license: license, client: license.client, is_uat: true,
                             proctoring_credits_debited: 7)
      create(:license_usage, license: license, client: license.client, is_uat: true,
                             proctoring_credits_debited: 5)

      expect(license.uat_used_number).to eq(12)
    end

    it 'treats legacy rows without a debited value as a single credit' do
      license = create(:proctoring_license, uat_usage_limit: 300)
      create(:license_usage, license: license, client: license.client, is_uat: true,
                             proctoring_credits_debited: nil)

      expect(license.uat_used_number).to eq(1)
    end
  end

  describe '#enough_uat_licenses?' do
    it 'is false once the pool is consumed' do
      license = create(:license, uat_usage_limit: 1)
      create(:license_usage, license: license, client: license.client, is_uat: true)

      expect(license.enough_uat_licenses?).to eq(false)
    end

    it 'is true while the pool has room' do
      license = create(:license, uat_usage_limit: 1)

      expect(license.enough_uat_licenses?).to eq(true)
    end
  end
end
