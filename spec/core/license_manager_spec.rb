# frozen_string_literal: true

require 'rails_helper'

describe LicenseManager do
  let(:client) { create(:tenancy) }
  let(:report_family) { create(:report_family) }

  describe '.get_applicable_licenses' do
    context 'when license_type is common' do
      let(:license_type) { 'common' }

      before do
        create(:license, client: client, type: 'common', report_family: report_family, end_date: 1.month.from_now)
        create(:license, client: client, type: 'common', report_family: report_family, end_date: 2.months.from_now)
        create(:license, client: client, type: 'common', end_date: 1.month.from_now)
      end

      it 'returns licenses filtered by report_family_id' do
        context = { report_family_id: report_family.id }
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.count).to eq(2)
        expect(licenses.pluck(:report_family_id).uniq).to eq([report_family.id])
      end

      it 'returns licenses ordered by end_date ascending' do
        context = { report_family_id: report_family.id }
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.first.end_date).to be < licenses.last.end_date
      end

      it 'excludes expired licenses' do
        create(:license, client: client, type: 'common', report_family: report_family, start_date: 2.days.ago,
end_date: 1.day.ago)

        context = { report_family_id: report_family.id }
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.count).to eq(2)
        expect(licenses.all? { |license| license.end_date > Time.zone.now }).to be true
      end

      it 'returns empty array when no licenses match report_family' do
        other_report_family = create(:report_family)

        context = { report_family_id: other_report_family.id }
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.count).to eq(0)
      end
    end

    context 'when license_type is threesixty' do
      let(:license_type) { 'threesixty' }

      before do
        create(:license, client: client, type: 'threesixty', end_date: 1.month.from_now)
        create(:license, client: client, type: 'threesixty', end_date: 2.months.from_now)
        create(:license, client: client, type: 'common', end_date: 1.month.from_now)
      end

      it 'returns licenses of the specified type' do
        context = {}
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.count).to eq(2)
        expect(licenses.pluck(:type).uniq).to eq(['threesixty'])
      end

      it 'does not filter by report_family_id' do
        context = { report_family_id: report_family.id }
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.count).to eq(2)
      end
    end

    context 'when license_type is proctoring' do
      let(:license_type) { 'proctoring' }

      before do
        create(:license, client: client, type: 'proctoring', end_date: 1.month.from_now)
        create(:license, client: client, type: 'idp', end_date: 1.month.from_now)
      end

      it 'returns only proctoring licenses' do
        context = {}
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.count).to eq(1)
        expect(licenses.first.type).to eq('proctoring')
      end
    end

    context 'when license_type is idp' do
      let(:license_type) { 'idp' }

      before do
        create(:license, client: client, type: 'idp', end_date: 1.month.from_now)
        create(:license, client: client, type: 'proctoring', end_date: 1.month.from_now)
      end

      it 'returns only idp licenses' do
        context = {}
        licenses = described_class.get_applicable_licenses(license_type, client, context)

        expect(licenses.count).to eq(1)
        expect(licenses.first.type).to eq('idp')
      end
    end

    context 'when no licenses exist' do
      it 'returns empty array' do
        context = {}
        licenses = described_class.get_applicable_licenses('common', client, context)

        expect(licenses).to be_empty
      end
    end

    context 'when context is empty' do
      before do
        create(:license, client: client, type: 'threesixty', end_date: 1.month.from_now)
      end

      it 'returns licenses for non-common types' do
        context = {}
        licenses = described_class.get_applicable_licenses('threesixty', client, context)

        expect(licenses.count).to eq(1)
      end
    end
  end

  describe '.get_valid_license_manager' do
    context 'when license type is common' do
      let(:license) { create(:license, type: 'common') }

      it 'returns the Common license manager' do
        manager = described_class.get_valid_license_manager(license)

        expect(manager).to eq(LicenseManager::Common)
      end
    end

    context 'when license type is threesixty' do
      let(:license) { create(:license, type: 'threesixty') }

      it 'returns the Threesixty license manager' do
        manager = described_class.get_valid_license_manager(license)

        expect(manager).to eq(LicenseManager::Threesixty)
      end
    end

    context 'when license type is proctoring' do
      let(:license) { create(:license, type: 'proctoring') }

      it 'returns the Proctoring license manager' do
        manager = described_class.get_valid_license_manager(license)

        expect(manager).to eq(LicenseManager::Proctoring)
      end
    end

    context 'when license type is idp' do
      let(:license) { create(:license, type: 'idp') }

      it 'returns the Idp license manager' do
        manager = described_class.get_valid_license_manager(license)

        expect(manager).to eq(LicenseManager::Idp)
      end
    end

    context 'when license type is not implemented' do
      let(:license) { double(type: 'unknown_type') }

      it 'raises NotImplementedError' do
        expect do
          described_class.get_valid_license_manager(license)
        end.to raise_error(NotImplementedError, /License manager for type unknown_type is not implemented/)
      end
    end
  end

  describe 'LICENSE_MANAGERS constant' do
    it 'contains all expected license types' do
      expected_types = %w[common threesixty proctoring idp]

      expect(LicenseManager::LICENSE_MANAGERS.keys).to match_array(expected_types)
    end

    it 'maps each type to the correct manager class' do
      expect(LicenseManager::LICENSE_MANAGERS['common']).to eq(LicenseManager::Common)
      expect(LicenseManager::LICENSE_MANAGERS['threesixty']).to eq(LicenseManager::Threesixty)
      expect(LicenseManager::LICENSE_MANAGERS['proctoring']).to eq(LicenseManager::Proctoring)
      expect(LicenseManager::LICENSE_MANAGERS['idp']).to eq(LicenseManager::Idp)
    end
  end
end
