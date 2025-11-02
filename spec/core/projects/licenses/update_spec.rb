# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::Licenses::Update do
  describe '#call!' do
    let(:project) { create(:project) }
    let(:license) { create(:license, number: 10) }
    let(:project_license) { create(:project_license, project: project, license: license, usage_limit: 5) }
    let(:form) do
      Api::V2::Administration::Projects::LicenseForm.from_model(project_license).tap do |f|
        f.attributes = {
          usage_limit: 8,
          enabled: true
        }
      end
    end

    it 'updates the project license' do
      described_class.call!(form, project_license)
      expect(project_license.reload.usage_limit).to eq(8)
    end
  end
end
