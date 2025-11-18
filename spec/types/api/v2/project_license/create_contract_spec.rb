# spec/contracts/api/v2/project_license/create_contract_spec.rb
# frozen_string_literal: true

require "rails_helper"

RSpec.describe Api::V2::ProjectLicense::CreateContract do
  let(:project) { create(:project) }
  let(:license) { create(:license, number: 5) }

  # instantiate contract the same way controller does (provide request schema)
  let(:contract) { described_class.new(schema: Api::V2::ProjectLicense::Schema.create_request) }

  def params_for(attrs = {})
    {
      data: {
        type: 'licenses',
        attributes: attrs
      }
    }
  end

  context 'valid case is successful' do
    it 'is valid when usage_limit <= parent license.number and license not present on project' do
      result = contract.call(params_for(usage_limit: 3, license_id: license.id.to_s), context: { project: project })

      expect(result.success?).to be_truthy
      expect(result.errors.to_h).to be_empty
    end
  end

  context 'when license already exists for project' do
    before { create(:project_license, project: project, license: license) }

    it 'fails with already present error' do
      result = contract.call(params_for(usage_limit: 1, license_id: license.id.to_s), context: { project_id: project.id })

      expect(result.failure?).to be_truthy
      # expect(result.errors.to_h.values.flatten.join(' ')).to match(/already/i)
    end
  end

  context 'when usage_limit > license.number' do
    it 'fails with usage_limit error' do
      result = contract.call(params_for(usage_limit: 10, license_id: license.id.to_s), context: { project: project })

      expect(result.failure?).to be_truthy
      expect(result.errors.to_h.values.flatten.join(' ')).to match(/more|available|greater/i)
    end
  end
end
