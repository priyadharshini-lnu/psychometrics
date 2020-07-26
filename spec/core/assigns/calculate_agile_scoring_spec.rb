# frozen_string_literal: true

require 'rails_helper'

describe Assigns::CalculateInnovationStyles do
  let(:assign) { create(:assign) }
  let(:dimension) { assign.assessment.dimension }
  let(:factor1) { create(:factor, dimension: dimension) }
  let(:factor2) { create(:factor, dimension: dimension) }
  let(:factor3) { create(:factor, dimension: dimension) }
  let(:agile) { create(:agile, assessment: assign.assessment) }

  # let(:config) {
  #   {}
  # }

  context '.call' do
    xit 'calculates agile score' do
      # TODO
    end

    xit 'adds factor score' do
      # TODO
    end

    xit 'adds zscore' do
      # TODO
    end

    xit 'adds percentile' do
      # TODO
    end

    xit 'adds normed score' do
      # TODO
    end
  end
end
