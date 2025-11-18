# frozen_string_literal: true

require "rails_helper"

RSpec.describe Api::V2::ProjectLicense::Contract do
  let(:schema) do
    Dry::Schema.Params do
      required(:data).hash do
        required(:attributes).hash do
          required(:usage_limit).filled(:integer)
          required(:license_id).filled(:string)
        end
      end
    end
  end
  subject(:result) { described_class.new(schema: schema).call(params, context: context) }

  let(:params) do
    {
      data: {
        attributes: {
          usage_limit: usage_limit,
          license_id: license_id
        }
      }
    }
  end

  let(:usage_limit) { 5 }
  let(:license_id)  { parent_license.id.to_s }

  let(:context) { {} } # overridden in specific cases

  let(:parent_license) { create(:license, number: 10) }

  before do
    allow(License).to receive(:find_by).with(id: parent_license.id.to_s).and_return(parent_license)
  end

  # CASE 1: Valid usage_limit (<= parent license number)
  context "when usage_limit is valid" do
    let(:context) { { project_license: create(:project_license, license: parent_license) } }

    it "is valid" do
      expect(result).to be_success
    end
  end

  # CASE 2: usage_limit exceeds parent license number
  context "when usage_limit exceeds available number" do
    let(:usage_limit) { 20 }
    let(:context) { { project_license: create(:project_license, license: parent_license) } }

    it "is invalid" do
      expect(result).not_to be_success
      expect(result.errors.to_h).to include(
        data: {
          attributes: {
            usage_limit: include(I18n.t(
              "activemodel.errors.models.project_license.attributes.usage_limit.cant_be_more_than_available",
              usage_limit: parent_license.number
            ))
          }
        }
      )
    end
  end

  # CASE 3: No project_license in context → rule should still run via License.find_by
  context "when project_license is not provided in context" do
    let(:context) { {} }

    it "is valid because parent license is found via License.find_by" do
      expect(result).to be_success
    end
  end

  # CASE 4: No parent license found → rule should skip entirely
  context "when parent license is not found" do
    before do
      allow(License).to receive(:find_by).with(id: parent_license.id.to_s).and_return(nil)
    end

    it "skips validation and stays valid" do
      expect(result).to be_success
    end
  end
end
