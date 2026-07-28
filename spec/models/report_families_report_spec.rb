# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportFamiliesReport, type: :model do
  subject(:report_families_report) { described_class.new(report_family: report_family, report: report) }

  let(:owner_mismatch_message) do
    I18n.t('admin.owner_resource_mismatch',
           child_resource: I18n.t('admin.owner_resource_report'),
           parent_resource: I18n.t('admin.owner_resource_report_bundle'))
  end

  let(:report_family) { build(:report_family, tenant_id: report_family_tenant_id) }
  let(:report) { build(:report, owner: report_owner, report_families: []) }

  context 'when report family owner is nil' do
    let(:report_family_tenant_id) { nil }

    context 'when report owner is nil' do
      let(:report_owner) { nil }

      it 'is valid' do
        expect(report_families_report).to be_valid
      end
    end

    context 'when report owner is present' do
      let(:report_owner) { create(:tenancy) }

      it 'is invalid' do
        report_families_report.valid?
        expect(report_families_report.errors[:report]).to include(
          owner_mismatch_message
        )
      end
    end
  end

  context 'when report family owner is present' do
    let(:report_family_tenant_id) { create(:tenancy).id }

    context 'when report owner is nil' do
      let(:report_owner) { nil }

      it 'is valid' do
        expect(report_families_report).to be_valid
      end
    end

    context 'when report owner is same as report family owner' do
      let(:report_owner) { Client.find(report_family_tenant_id) }

      it 'is valid' do
        expect(report_families_report).to be_valid
      end
    end

    context 'when report owner is different from report family owner' do
      let(:report_owner) { create(:tenancy) }

      it 'is invalid' do
        report_families_report.valid?
        expect(report_families_report.errors[:report]).to include(
          owner_mismatch_message
        )
      end
    end

    context 'when report family changes to an incompatible owner' do
      let(:other_owner) { create(:tenancy) }
      let(:report_owner) { Client.find(report_family_tenant_id) }
      let(:other_report_family) { create(:report_family, tenant_id: other_owner.id) }
      let!(:persisted_report_families_report) do
        create(:report_families_report, report_family: report_family, report: report)
      end

      it 'is invalid on update' do
        persisted_report_families_report.report_family = other_report_family

        expect(persisted_report_families_report).not_to be_valid
        expect(persisted_report_families_report.errors[:report]).to include(
          owner_mismatch_message
        )
      end
    end
  end
end
