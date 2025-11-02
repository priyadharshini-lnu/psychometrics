# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::Licenses::Create do
  describe '#call!' do
    let(:project) { create(:project) }
    let(:license) { create(:license, number: 10) }
    let(:form) do
      Api::V2::Administration::Projects::LicenseForm.new(
        project: project,
        license_id: license.id,
        usage_limit: 5,
        enabled: true
      )
    end

    it 'creates a new project license' do
      expect { described_class.call!(form, project) }.to change(ProjectLicense, :count).by(1)
    end
  end
end
