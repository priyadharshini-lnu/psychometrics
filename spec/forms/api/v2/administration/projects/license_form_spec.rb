# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Projects::LicenseForm, type: :model do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:report_family) { create(:report_family) }
  let(:license) { create(:license, client: client, report_family: report_family, number: 5, is_project_specific: true) }

  describe 'create validations' do
    it 'is invalid when the same license already exists for the project' do
      create(:project_license, project: project, license: license)
      form = described_class.new(project: project, license_id: license.id, usage_limit: 1, enabled: true)

      expect(form.valid?).to be_falsey
      expect(form.errors[:license_id]).to be_present
    end

    it 'is invalid when usage_limit is greater than parent license number' do
      form = described_class.new(project: project, license_id: license.id, usage_limit: 10, enabled: true)

      expect(form.valid?).to be_falsey
      expect(form.errors[:usage_limit]).to be_present
    end

    it 'is valid for a proper create (usage_limit <= parent number and unique)' do
      form = described_class.new(project: project, license_id: license.id, usage_limit: 3, enabled: true)

      expect(form.valid?).to be_truthy
      expect(form.errors).to be_empty
    end

    it 'is valid for create when usage_limit is nil (no explicit limit)' do
      form = described_class.new(project: project, license_id: license.id, usage_limit: nil, enabled: true)

      expect(form.valid?).to be_truthy
      expect(form.errors).to be_empty
    end
  end

  describe 'update validations' do
    it 'is invalid when reducing usage_limit below used number' do
      project_license = create(:project_license, project: project, license: license, usage_limit: 5, used_number: 3)
      form = described_class.from_model(project_license)
      form.attributes = { usage_limit: 2, project_license: project_license }

      expect(form.valid?).to be_falsey
      expect(form.errors[:usage_limit]).to be_present
    end

    it 'is valid when updating usage_limit but keeping it >= used number' do
      project_license = create(:project_license, project: project, license: license, usage_limit: 5, used_number: 3)
      form = described_class.from_model(project_license)
      form.attributes = { usage_limit: 4, project_license: project_license }

      expect(form.valid?).to be_truthy
      expect(form.errors).to be_empty
    end

    it 'is valid when updating other attributes (e.g. enabled) without changing usage_limit' do
      project_license = create(:project_license, project: project, license: license, usage_limit: 5, used_number: 3,
enabled: true)
      form = described_class.from_model(project_license)
      form.attributes = { enabled: false, project_license: project_license }

      expect(form.valid?).to be_truthy
      expect(form.errors).to be_empty
    end
  end
end
