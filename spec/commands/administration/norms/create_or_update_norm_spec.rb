# frozen_string_literal: true

require 'rails_helper'

describe Administration::Norms::CreateOrUpdateNorm do
  let(:norm) { create(:norm, :percentile, name: 'Some Norm') }

  context 'Success' do
    subject do
      attributes = {
        norm_id: norm.id,
        norm_type: 'percentile',
        factor_id: 1,
        field_name: 'mean',
        field_value: 2.0
      }
      form = Administration::Norms::PercentileNormFactor.new(attributes)
      described_class.call(form)
    end

    it 'broadcasts :ok' do
      expect { subject }.to broadcast(:ok)
      expect(subject[:ok]).to be_an_instance_of(FactorsNorm)

      factors_norm = subject[:ok]
      props = factors_norm.props[0]

      expect(props['mean']).to eql(2.0)
    end
  end
end
