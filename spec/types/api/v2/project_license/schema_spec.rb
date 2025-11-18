# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::ProjectLicense::Schema do
  describe '.attributes' do
    it 'request schema allows request attributes' do
      proc_obj = described_class.attributes({}, :request)
      request_schema = Dry::Schema.Params do
        instance_exec(&proc_obj)
      end

      result = request_schema.call(
        data: {
          attributes: {
            license_id: 1,
            usage_limit: 2,
            enabled: true
          }
        }
      )

      expect(result.errors.to_h).to be_empty
    end

    it 'response schema validates response attributes' do
      proc_obj = described_class.attributes({}, :response)
      response_schema = Dry::Schema.Params do
        instance_exec(&proc_obj)
      end

      result = response_schema.call(
        data: {
          attributes: {
            used_number: 2
          }
        }
      )

      expect(result.errors.to_h).to be_empty
    end

  end

  it 'declares the correct resource name' do
    expect(described_class.resource).to eq('licenses')
  end

  it 'exposes expected relationships for the schema' do
    rels = described_class.relationships(nil)
    names = rels.map { |r| r[:name] }
    expect(names).to include(:license, :project)
  end
end
