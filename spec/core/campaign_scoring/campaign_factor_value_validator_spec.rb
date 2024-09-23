# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignScoring::CampaignFactorValueValidator do
  let(:campaign) { create(:campaign) }
  let(:campaign_factor) do
    create(
      :campaign_factor, code: 'previous_score', campaign: campaign, factor_type: 'formula',
      output_type: output_type, formula: "return datasheet.value('Previous Score')"
    )
  end

  subject { described_class.new(campaign_factor, factor_value) }

  describe '#call' do
    context 'when factor_value is nil' do
      let(:factor_value) { nil }
      let(:output_type) { 'numeric' }

      it 'does not raise an error' do
        expect { subject.call }.not_to raise_error
      end
    end

    context 'when factor_value is a hash without :value key' do
      let(:factor_value) { { label: 'Previous Score' } }
      let(:output_type) { 'numeric' }

      it 'raises a WrongOutputType error' do
        expect do
          subject.call
        end.to raise_error(CampaignScoring::Exceptions::WrongOutputType,
                           'Expected factor value with type Hash to have a key :value. Got nil')
      end
    end

    context 'when factor_value is a string and output_type is string' do
      let(:factor_value) { '85' }
      let(:output_type) { 'string' }

      it 'does not raise an error' do
        expect { subject.call }.not_to raise_error
      end
    end

    context 'when factor_value is a string and output_type is numeric' do
      let(:factor_value) { '85' }
      let(:output_type) { 'numeric' }

      it 'raises a WrongOutputType error' do
        expect do
          subject.call
        end.to raise_error(CampaignScoring::Exceptions::WrongOutputType,
                           "Expected factor value for 'previous_score' to be a numeric. Got String")
      end
    end

    context 'when factor_value is a numeric and output_type is numeric' do
      let(:factor_value) { 85 }
      let(:output_type) { 'numeric' }

      it 'does not raise an error' do
        expect { subject.call }.not_to raise_error
      end
    end

    context 'when factor_value is a numeric and output_type is string' do
      let(:factor_value) { 85 }
      let(:output_type) { 'string' }

      it 'raises a WrongOutputType error' do
        expect do
          subject.call
        end.to raise_error(CampaignScoring::Exceptions::WrongOutputType,
                           "Expected factor value for 'previous_score' to be a string. Got Integer")
      end
    end

    context 'when factor_value is an infinite numeric' do
      let(:factor_value) { Float::INFINITY }
      let(:output_type) { 'numeric' }

      it 'raises a WrongOutputType error' do
        expect do
          subject.call
        end.to raise_error(CampaignScoring::Exceptions::WrongOutputType,
                           "Expected factor value for 'previous_score'. Got Infinity value")
      end
    end
  end
end
