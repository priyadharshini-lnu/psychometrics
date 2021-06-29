# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SavilleAssessmentSetting, type: :model do
  let(:saville_assessment_setting) do
    create(:saville_assessment_setting, saville_assessment_id: '73F44184-EED3-400D-B4BB-14925E4502D3')
  end

  it 'sets saville_norm_id to default_norm_id' do
    expect(saville_assessment_setting.saville_norm_id).to eq('DB13563C-4029-4473-848A-AFDF2C59DFB8')
  end

  describe '#saville_norms' do
    it 'returns all saville_norms for particula assessment' do
      expect(saville_assessment_setting.saville_norms).to eq(
        [
          {
            id: 'DB13563C-4029-4473-848A-AFDF2C59DFB8',
            name: 'Spatial Reasoning Aptitude & Pace (Rx) - Apprentices (INT, IA, 2018)'
          },
          {
            id: 'FFDAD963-8912-44B5-80EA-8E6503B92382',
            name: 'Spatial Reasoning Aptitude & Pace (Rx) - Technical Occupations (INT, IA, 2018)'
          }
        ]
      )
    end
  end
end
