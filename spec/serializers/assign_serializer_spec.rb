# frozen_string_literal: true

require 'rails_helper'

describe AssignSerializer do
  # rubocop:disable Layout/LineLength
  let(:external_scores) { { rawScores: { scaleScores: [{ id: 1, scaleName: 'Aesthetic', scaleScore: '42' }, { id: 2, scaleName: 'Affiliation', scaleScore: '42' }, { id: 3, scaleName: 'Altruistic', scaleScore: '43' }, { id: 4, scaleName: 'Commercial', scaleScore: '46' }, { id: 5, scaleName: 'Hedonistic', scaleScore: '42' }, { id: 6, scaleName: 'Power', scaleScore: '50' }, { id: 7, scaleName: 'Recognition', scaleScore: '44' }, { id: 8, scaleName: 'Scientific', scaleScore: '38' }, { id: 9, scaleName: 'Security', scaleScore: '41' }, { id: 10, scaleName: 'Tradition', scaleScore: '44' }], subscaleScores: [] }, percentileScores: { scaleScores: [{ id: 1, scaleName: 'Aesthetic', scaleScore: '82' }, { id: 2, scaleName: 'Affiliation', scaleScore: '9' }, { id: 3, scaleName: 'Altruistic', scaleScore: '23' }, { id: 4, scaleName: 'Commercial', scaleScore: '64' }, { id: 5, scaleName: 'Hedonistic', scaleScore: '64' }, { id: 6, scaleName: 'Power', scaleScore: '66' }, { id: 7, scaleName: 'Recognition', scaleScore: '70' }, { id: 8, scaleName: 'Scientific', scaleScore: '30' }, { id: 9, scaleName: 'Security', scaleScore: '48' }, { id: 10, scaleName: 'Tradition', scaleScore: '49' }], subscaleScores: [{ id: 1, subscaleName: 'Aesthetic_Lifestyles', subscaleScore: '3' }, { id: 2, subscaleName: 'Aesthetic_Beliefs', subscaleScore: '3' }, { id: 3, subscaleName: 'Aesthetic_Occupational_Preferences', subscaleScore: '4' }, { id: 4, subscaleName: 'Aesthetic_Aversions', subscaleScore: '4' }, { id: 5, subscaleName: 'Aesthetic_Preferred_Associates', subscaleScore: '3' }, { id: 6, subscaleName: 'Affiliation_Lifestyles', subscaleScore: '2' }, { id: 7, subscaleName: 'Affiliation_Beliefs', subscaleScore: '1' }, { id: 8, subscaleName: 'Affiliation_Occupational_Preferences', subscaleScore: '1' }, { id: 9, subscaleName: 'Affiliation_Aversions', subscaleScore: '3' }, { id: 10, subscaleName: 'Affiliation_Preferred_Associates', subscaleScore: '3' }, { id: 11, subscaleName: 'Altruistic_Lifestyles', subscaleScore: '1' }, { id: 12, subscaleName: 'Altruistic_Beliefs', subscaleScore: '1' }, { id: 13, subscaleName: 'Altruistic_Occupational_Preferences', subscaleScore: '3' }, { id: 14, subscaleName: 'Altruistic_Aversions', subscaleScore: '2' }, { id: 15, subscaleName: 'Altruistic_Preferred_Associates', subscaleScore: '3' }, { id: 16, subscaleName: 'Commercial_Lifestyles', subscaleScore: '3' }, { id: 17, subscaleName: 'Commercial_Beliefs', subscaleScore: '3' }, { id: 18, subscaleName: 'Commercial_Occupational_Preferences', subscaleScore: '3' }, { id: 19, subscaleName: 'Commercial_Aversions', subscaleScore: '1' }, { id: 20, subscaleName: 'Commercial_Preferred_Associates', subscaleScore: '3' }, { id: 21, subscaleName: 'Hedonistic_Lifestyles', subscaleScore: '3' }, { id: 22, subscaleName: 'Hedonistic_Beliefs', subscaleScore: '1' }, { id: 23, subscaleName: 'Hedonistic_Occupational_Preferences', subscaleScore: '4' }, { id: 24, subscaleName: 'Hedonistic_Aversions', subscaleScore: '2' }, { id: 25, subscaleName: 'Hedonistic_Preferred_Associates', subscaleScore: '4' }, { id: 26, subscaleName: 'Power_Lifestyles', subscaleScore: '2' }, { id: 27, subscaleName: 'Power_Beliefs', subscaleScore: '2' }, { id: 28, subscaleName: 'Power_Occupational_Preferences', subscaleScore: '4' }, { id: 29, subscaleName: 'Power_Aversions', subscaleScore: '3' }, { id: 30, subscaleName: 'Power_Preferred_Associates', subscaleScore: '3' }, { id: 31, subscaleName: 'Recognition_Lifestyles', subscaleScore: '2' }, { id: 32, subscaleName: 'Recognition_Beliefs', subscaleScore: '3' }, { id: 33, subscaleName: 'Recognition_Occupational_Preferences', subscaleScore: '4' }, { id: 34, subscaleName: 'Recognition_Aversions', subscaleScore: '2' }, { id: 35, subscaleName: 'Recognition_Preferred_Associates', subscaleScore: '4' }, { id: 36, subscaleName: 'Scientific_Lifestyles', subscaleScore: '1' }, { id: 37, subscaleName: 'Scientific_Beliefs', subscaleScore: '2' }, { id: 38, subscaleName: 'Scientific_Occupational_Preferences', subscaleScore: '1' }, { id: 39, subscaleName: 'Scientific_Aversions', subscaleScore: '1' }, { id: 40, subscaleName: 'Scientific_Preferred_Associates', subscaleScore: '4' }, { id: 41, subscaleName: 'Security_Lifestyles', subscaleScore: '3' }, { id: 42, subscaleName: 'Security_Beliefs', subscaleScore: '2' }, { id: 43, subscaleName: 'Security_Occupational_Preferences', subscaleScore: '3' }, { id: 44, subscaleName: 'Security_Aversions', subscaleScore: '2' }, { id: 45, subscaleName: 'Security_Preferred_Associates', subscaleScore: '2' }, { id: 46, subscaleName: 'Tradition_Lifestyles', subscaleScore: '3' }, { id: 47, subscaleName: 'Tradition_Beliefs', subscaleScore: '4' }, { id: 48, subscaleName: 'Tradition_Occupational_Preferences', subscaleScore: '1' }, { id: 49, subscaleName: 'Tradition_Aversions', subscaleScore: '1' }, { id: 50, subscaleName: 'Tradition_Preferred_Associates', subscaleScore: '4' }] } } }
  let(:external_results) do
    {
      clientId: 'TALENTENTERPRISETEST',
      groupName: 'Group',
      clientUserId: 'tAlentUser011',
      participantId: 'UJ890966',
      empId: 'hogan2@gmail.com',
      assessmentId: 'MVPI',
      assessmentFormId: nil,
      normId: 'Global',
      assessmentDate: '2/2/2021 10:39:04 AM',
      scores: external_scores,
      messageType: '',
      text: '',
      hasSignature: {
        createdBy: nil,
        createdDate: nil,
        producedBy: nil,
        requestedBy: 'tAlentUser011',
        requestedIpAddress: nil,
        requestId: nil
      }
    }
  end
  # rubocop:enable Layout/LineLength
  let(:assessment) { create(:assessment, type: 'Assessments::Hogan', category: 'hogan', dimension: nil) }
  let!(:assigns_report) { create(:assigns_report, :licensed, assign: assign, hogan_score: external_results) }
  let(:assign) { create(:assign, assessment: assessment, external_results: external_results) }

  # Causing issue after migrating to panko serializers

  describe '#external_scoring' do
    it do
      # assign.original_assign = assign
      # external_scoring = described_class.new(context: {}).serialize(assign)['external_scoring']

      # expect(external_scoring).to eq({
      #   'RawScale' => {
      #     '01' => 42.0,
      #     '02' => 42.0,
      #     '03' => 43.0,
      #     '04' => 46.0,
      #     '05' => 42.0,
      #     '06' => 50.0,
      #     '07' => 44.0,
      #     '08' => 38.0,
      #     '09' => 41.0,
      #     '10' => 44.0
      #   },
      #   'PercentileScale' => {
      #     '01' => 82.0,
      #     '02' => 9.0,
      #     '03' => 23.0,
      #     '04' => 64.0,
      #     '05' => 64.0,
      #     '06' => 66.0,
      #     '07' => 70.0,
      #     '08' => 30.0,
      #     '09' => 48.0,
      #     '10' => 49.0
      #   },
      #   'PercentileSubscale' => {
      #     '01' => 3.0,
      #     '02' => 3.0,
      #     '03' => 4.0,
      #     '04' => 4.0,
      #     '05' => 3.0,
      #     '06' => 2.0,
      #     '07' => 1.0,
      #     '08' => 1.0,
      #     '09' => 3.0,
      #     '10' => 3.0,
      #     '11' => 1.0,
      #     '12' => 1.0,
      #     '13' => 3.0,
      #     '14' => 2.0,
      #     '15' => 3.0,
      #     '16' => 3.0,
      #     '17' => 3.0,
      #     '18' => 3.0,
      #     '19' => 1.0,
      #     '20' => 3.0,
      #     '21' => 3.0,
      #     '22' => 1.0,
      #     '23' => 4.0,
      #     '24' => 2.0,
      #     '25' => 4.0,
      #     '26' => 2.0,
      #     '27' => 2.0,
      #     '28' => 4.0,
      #     '29' => 3.0,
      #     '30' => 3.0,
      #     '31' => 2.0,
      #     '32' => 3.0,
      #     '33' => 4.0,
      #     '34' => 2.0,
      #     '35' => 4.0,
      #     '36' => 1.0,
      #     '37' => 2.0,
      #     '38' => 1.0,
      #     '39' => 1.0,
      #     '40' => 4.0,
      #     '41' => 3.0,
      #     '42' => 2.0,
      #     '43' => 3.0,
      #     '44' => 2.0,
      #     '45' => 2.0,
      #     '46' => 3.0,
      #     '47' => 4.0,
      #     '48' => 1.0,
      #     '49' => 1.0,
      #     '50' => 4.0
      #   }
      # })
    end
  end
end
