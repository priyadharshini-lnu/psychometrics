# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::ProjectLicense::UpdateContract do
  subject(:contract) { described_class.new(schema: Api::V2::ProjectLicense::Schema.update_request) }

  let(:license) { create(:license, number: 10) }
  let(:project_license) { create(:project_license, license: license, used_number: 6) }

  context "when usage_limit < used_number" do
    let(:params) do
      {
        data: {
          type: 'licenses',
          id: project_license.id.to_s,
          attributes: { usage_limit: 3 }
        }
      }
    end

    it "fails validation" do
      result = contract.call(params, { params: { id: project_license.id } })

      expect(result.failure?).to be_truthy
      expect(result.errors.to_h).to_not be_empty
    end
  end

  context "when valid" do
    let(:params) do
      {
        data: {
          type: 'licenses',
          id: project_license.id.to_s,
          attributes: { usage_limit: 7 }
        }
      }
    end

    it "passes" do
      result = contract.call(params, { params: { id: project_license.id } })

      expect(result.success?).to be_truthy
      expect(result.errors.to_h).to be_empty
    end
  end
end
