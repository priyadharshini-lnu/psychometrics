# frozen_string_literal: true

require "rails_helper"

RSpec.describe Api::V2::ProjectLicense::CreateContract do
  let(:project) { create(:project) }
  let(:license) { create(:license, number: 5) }

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
      result = contract.call(params_for(usage_limit: 3, license_id: license.id.to_s), { project: project })

      expect(result.success?).to be_truthy
      expect(result.errors.to_h).to be_empty
    end
  end

  context 'when license already exists for project' do
    before { create(:project_license, project: project, license: license) }

    it 'fails with already present error' do
      result = contract.call(params_for(usage_limit: 1, license_id: license.id.to_s), { project: project })

      expect(result.failure?).to be_truthy

      expected_message = I18n.t('activemodel.errors.models.project_license.attributes.license_id.already_present')
      error_message = result.errors.to_h.values.flatten.join(' ')
      expect(error_message).to include(expected_message)
    end
  end

  context 'when usage_limit > license.number' do
    it 'fails with usage_limit error' do
      result = contract.call(params_for(usage_limit: 10, license_id: license.id.to_s), { project: project })

      expect(result.failure?).to be_truthy

      expected_message = I18n.t('activemodel.errors.models.project_license.attributes.usage_limit.cant_be_more_than_available', usage_limit: license.number)
      error_message = result.errors.to_h.values.flatten.join(' ')
      expect(error_message).to include(expected_message)
    end
  end
end
