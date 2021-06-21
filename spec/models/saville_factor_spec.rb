# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SavilleFactor, type: :model do
  describe '#get_factors' do
    it 'returns all factors with score_types as a hash' do
      assessment_id1 = SecureRandom.uuid
      assessment_id2 = SecureRandom.uuid
      factor_id1 = SecureRandom.uuid
      factor_id2 = SecureRandom.uuid

      sf1 = create(:saville_factor, score_type: 'Nipsitive', value_type: 'percentile',
        assessment_id: assessment_id1, factor_id: factor_id1)
      create(:saville_factor, score_type: 'Nipsitive', value_type: 'sten',
        assessment_id: assessment_id1, factor_id: factor_id1)
      create(:saville_factor, score_type: 'Ipsative', value_type: 'z',
        assessment_id: assessment_id1, factor_id: factor_id1)
      sf4 = create(:saville_factor, score_type: 'Raw', value_type: 't',
        assessment_id: assessment_id1, factor_id: factor_id2)

      create(:saville_factor, score_type: 'Nipsitive', value_type: 'sten',
        assessment_id: assessment_id2, factor_id: factor_id1)

      expect(SavilleFactor.get_factors(assessment_id1)).to eq(
        [
          {
            id: factor_id1,
            name: sf1.name,
            score_types: { 'Nipsitive' => %w[percentile sten], 'Ipsative' => ['z'] }
          },
          {
            id: factor_id2,
            name: sf4.name,
            score_types: { 'Raw' => ['t'] }
          }
        ]
      )
    end
  end
end
