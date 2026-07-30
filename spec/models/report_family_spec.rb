# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportFamily, type: :model do
  describe 'owner compatibility with associated reports' do
    let(:owner_mismatch_message) do
      I18n.t('admin.owner_resource_mismatch',
             child_resource: I18n.t('admin.owner_resource_report'),
             parent_resource: I18n.t('admin.owner_resource_report_bundle'))
    end

    let(:owner_a) { create(:tenancy) }
    let(:owner_b) { create(:tenancy) }

    let(:assessment) { create(:assessment, owner: owner_a, dimension: create(:dimension, owner: owner_a)) }
    let(:report) do
      create(
        :report,
        owner: owner_a,
        report_families: [],
        assessments: [assessment],
        skip_owner_validation: true
      )
    end
    let!(:report_family) { create(:report_family, tenant_id: owner_a.id) }
    let!(:report_families_report) { ReportFamiliesReport.create!(report_family: report_family, report: report) }

    before do
      report.update_column(:tenant_id, owner_a.id)
    end

    it 'is invalid when owner changes to a value incompatible with associated reports' do
      expect(ReportFamiliesReport.where(report_family_id: report_family.id).pluck(:report_id)).to include(report.id)

      # Create a new instance to test the validation with unsaved changes
      test_report_family = report_family.dup
      test_report_family.id = report_family.id
      test_report_family.tenant_id = owner_b.id

      expect(test_report_family).not_to be_valid
      expect(test_report_family.errors[:tenant_id]).to include(owner_mismatch_message)
    end

    it 'is valid when owner changes to nil and associated reports have nil owner' do
      report.update_column(:tenant_id, nil)
      report_family.update_column(:tenant_id, nil)
      report_family.reload

      expect(report_family).to be_valid
    end

    it 'does not run owner compatibility check when owner_id is unchanged' do
      report.update_column(:tenant_id, owner_b.id)

      report_family.name = 'Updated bundle name'

      expect(report_family).to be_valid
    end
  end
end
