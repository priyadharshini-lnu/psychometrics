# frozen_string_literal: true

require 'rails_helper'

describe Hogan::NormalizeOldResults do
  # rubocop:disable Layout/LineLength
  let(:old_results) { { participant: { assessment: { type: 'MVPI', norms: { __content__: 'Global' }, score: [{ type: 'RAW', scales: { scale: { id: '01', type: 'Aesthetic', __content__: '42' } } }, { type: 'percentile', scales: { scale: [{ id: '01', type: 'Aesthetic', __content__: '82' }, { id: '02', type: 'Affiliation', __content__: '9' }, { id: '03', type: 'Altruistic', __content__: '23' }, { id: '04', type: 'Commercial', __content__: '64' }, { id: '05', type: 'Hedonistic', __content__: '64' }, { id: '06', type: 'Power', __content__: '66' }, { id: '07', type: 'Recognition', __content__: '70' }, { id: '08', type: 'Scientific', __content__: '30' }, { id: '09', type: 'Security', __content__: '48' }, { id: '10', type: 'Tradition', __content__: '49' }] }, subscales: { subscale: [{ id: '01', type: 'Aesthetic_Lifestyles', __content__: '3' }, { id: '02', type: 'Aesthetic_Beliefs', __content__: '3' }, { id: '03', type: 'Aesthetic_Occupational_Preferences', __content__: '4' }, { id: '04', type: 'Aesthetic_Aversions', __content__: '4' }, { id: '05', type: 'Aesthetic_Preferred_Associates', __content__: '3' }, { id: '06', type: 'Affiliation_Lifestyles', __content__: '2' }, { id: '07', type: 'Affiliation_Beliefs', __content__: '1' }, { id: '08', type: 'Affiliation_Occupational_Preferences', __content__: '1' }, { id: '09', type: 'Affiliation_Aversions', __content__: '3' }, { id: '10', type: 'Affiliation_Preferred_Associates', __content__: '3' }, { id: '11', type: 'Altruistic_Lifestyles', __content__: '1' }, { id: '12', type: 'Altruistic_Beliefs', __content__: '1' }, { id: '13', type: 'Altruistic_Occupational_Preferences', __content__: '3' }, { id: '14', type: 'Altruistic_Aversions', __content__: '2' }, { id: '15', type: 'Altruistic_Preferred_Associates', __content__: '3' }, { id: '16', type: 'Commercial_Lifestyles', __content__: '3' }, { id: '17', type: 'Commercial_Beliefs', __content__: '3' }, { id: '18', type: 'Commercial_Occupational_Preferences', __content__: '3' }, { id: '19', type: 'Commercial_Aversions', __content__: '1' }, { id: '20', type: 'Commercial_Preferred_Associates', __content__: '3' }, { id: '21', type: 'Hedonistic_Lifestyles', __content__: '3' }, { id: '22', type: 'Hedonistic_Beliefs', __content__: '1' }, { id: '23', type: 'Hedonistic_Occupational_Preferences', __content__: '4' }, { id: '24', type: 'Hedonistic_Aversions', __content__: '2' }, { id: '25', type: 'Hedonistic_Preferred_Associates', __content__: '4' }, { id: '26', type: 'Power_Lifestyles', __content__: '2' }, { id: '27', type: 'Power_Beliefs', __content__: '2' }, { id: '28', type: 'Power_Occupational_Preferences', __content__: '4' }, { id: '29', type: 'Power_Aversions', __content__: '3' }, { id: '30', type: 'Power_Preferred_Associates', __content__: '3' }, { id: '31', type: 'Recognition_Lifestyles', __content__: '2' }, { id: '32', type: 'Recognition_Beliefs', __content__: '3' }, { id: '33', type: 'Recognition_Occupational_Preferences', __content__: '4' }, { id: '34', type: 'Recognition_Aversions', __content__: '2' }, { id: '35', type: 'Recognition_Preferred_Associates', __content__: '4' }, { id: '36', type: 'Scientific_Lifestyles', __content__: '1' }, { id: '37', type: 'Scientific_Beliefs', __content__: '2' }, { id: '38', type: 'Scientific_Occupational_Preferences', __content__: '1' }, { id: '39', type: 'Scientific_Aversions', __content__: '1' }, { id: '40', type: 'Scientific_Preferred_Associates', __content__: '4' }, { id: '41', type: 'Security_Lifestyles', __content__: '3' }, { id: '42', type: 'Security_Beliefs', __content__: '2' }, { id: '43', type: 'Security_Occupational_Preferences', __content__: '3' }, { id: '44', type: 'Security_Aversions', __content__: '2' }, { id: '45', type: 'Security_Preferred_Associates', __content__: '2' }, { id: '46', type: 'Tradition_Lifestyles', __content__: '3' }, { id: '47', type: 'Tradition_Beliefs', __content__: '4' }, { id: '48', type: 'Tradition_Occupational_Preferences', __content__: '1' }, { id: '49', type: 'Tradition_Aversions', __content__: '1' }, { id: '50', type: 'Tradition_Preferred_Associates', __content__: '4' }] } }], remarks: '', assessmentdate: { __content__: '2/2/2021 10:39:04 AM' } }, demographic: { hoganuserid: 'UJ890966', ParticipantID: 'hogan2@gmail.com', participantinfo: { age: { __content__: '0' }, title: {}, gender: {}, lastname: { __content__: 'hog2' }, ethnicity: {}, firstname: { __content__: 'hogan2' }, middlename: {} } }, clientdetails: { clientid: 'TALENTENTERPRISETEST', groupname: 'Group', clientuserid: 'tAlentUser011' } } } }
  let(:new_score) { { rawScores: { scaleScores: [{ id: 1, scaleName: 'Aesthetic', scaleScore: '42' }], subscaleScores: [] }, percentileScores: { scaleScores: [{ id: 1, scaleName: 'Aesthetic', scaleScore: '82' }, { id: 2, scaleName: 'Affiliation', scaleScore: '9' }, { id: 3, scaleName: 'Altruistic', scaleScore: '23' }, { id: 4, scaleName: 'Commercial', scaleScore: '64' }, { id: 5, scaleName: 'Hedonistic', scaleScore: '64' }, { id: 6, scaleName: 'Power', scaleScore: '66' }, { id: 7, scaleName: 'Recognition', scaleScore: '70' }, { id: 8, scaleName: 'Scientific', scaleScore: '30' }, { id: 9, scaleName: 'Security', scaleScore: '48' }, { id: 10, scaleName: 'Tradition', scaleScore: '49' }], subscaleScores: [{ id: 1, subscaleName: 'Aesthetic_Lifestyles', subscaleScore: '3' }, { id: 2, subscaleName: 'Aesthetic_Beliefs', subscaleScore: '3' }, { id: 3, subscaleName: 'Aesthetic_Occupational_Preferences', subscaleScore: '4' }, { id: 4, subscaleName: 'Aesthetic_Aversions', subscaleScore: '4' }, { id: 5, subscaleName: 'Aesthetic_Preferred_Associates', subscaleScore: '3' }, { id: 6, subscaleName: 'Affiliation_Lifestyles', subscaleScore: '2' }, { id: 7, subscaleName: 'Affiliation_Beliefs', subscaleScore: '1' }, { id: 8, subscaleName: 'Affiliation_Occupational_Preferences', subscaleScore: '1' }, { id: 9, subscaleName: 'Affiliation_Aversions', subscaleScore: '3' }, { id: 10, subscaleName: 'Affiliation_Preferred_Associates', subscaleScore: '3' }, { id: 11, subscaleName: 'Altruistic_Lifestyles', subscaleScore: '1' }, { id: 12, subscaleName: 'Altruistic_Beliefs', subscaleScore: '1' }, { id: 13, subscaleName: 'Altruistic_Occupational_Preferences', subscaleScore: '3' }, { id: 14, subscaleName: 'Altruistic_Aversions', subscaleScore: '2' }, { id: 15, subscaleName: 'Altruistic_Preferred_Associates', subscaleScore: '3' }, { id: 16, subscaleName: 'Commercial_Lifestyles', subscaleScore: '3' }, { id: 17, subscaleName: 'Commercial_Beliefs', subscaleScore: '3' }, { id: 18, subscaleName: 'Commercial_Occupational_Preferences', subscaleScore: '3' }, { id: 19, subscaleName: 'Commercial_Aversions', subscaleScore: '1' }, { id: 20, subscaleName: 'Commercial_Preferred_Associates', subscaleScore: '3' }, { id: 21, subscaleName: 'Hedonistic_Lifestyles', subscaleScore: '3' }, { id: 22, subscaleName: 'Hedonistic_Beliefs', subscaleScore: '1' }, { id: 23, subscaleName: 'Hedonistic_Occupational_Preferences', subscaleScore: '4' }, { id: 24, subscaleName: 'Hedonistic_Aversions', subscaleScore: '2' }, { id: 25, subscaleName: 'Hedonistic_Preferred_Associates', subscaleScore: '4' }, { id: 26, subscaleName: 'Power_Lifestyles', subscaleScore: '2' }, { id: 27, subscaleName: 'Power_Beliefs', subscaleScore: '2' }, { id: 28, subscaleName: 'Power_Occupational_Preferences', subscaleScore: '4' }, { id: 29, subscaleName: 'Power_Aversions', subscaleScore: '3' }, { id: 30, subscaleName: 'Power_Preferred_Associates', subscaleScore: '3' }, { id: 31, subscaleName: 'Recognition_Lifestyles', subscaleScore: '2' }, { id: 32, subscaleName: 'Recognition_Beliefs', subscaleScore: '3' }, { id: 33, subscaleName: 'Recognition_Occupational_Preferences', subscaleScore: '4' }, { id: 34, subscaleName: 'Recognition_Aversions', subscaleScore: '2' }, { id: 35, subscaleName: 'Recognition_Preferred_Associates', subscaleScore: '4' }, { id: 36, subscaleName: 'Scientific_Lifestyles', subscaleScore: '1' }, { id: 37, subscaleName: 'Scientific_Beliefs', subscaleScore: '2' }, { id: 38, subscaleName: 'Scientific_Occupational_Preferences', subscaleScore: '1' }, { id: 39, subscaleName: 'Scientific_Aversions', subscaleScore: '1' }, { id: 40, subscaleName: 'Scientific_Preferred_Associates', subscaleScore: '4' }, { id: 41, subscaleName: 'Security_Lifestyles', subscaleScore: '3' }, { id: 42, subscaleName: 'Security_Beliefs', subscaleScore: '2' }, { id: 43, subscaleName: 'Security_Occupational_Preferences', subscaleScore: '3' }, { id: 44, subscaleName: 'Security_Aversions', subscaleScore: '2' }, { id: 45, subscaleName: 'Security_Preferred_Associates', subscaleScore: '2' }, { id: 46, subscaleName: 'Tradition_Lifestyles', subscaleScore: '3' }, { id: 47, subscaleName: 'Tradition_Beliefs', subscaleScore: '4' }, { id: 48, subscaleName: 'Tradition_Occupational_Preferences', subscaleScore: '1' }, { id: 49, subscaleName: 'Tradition_Aversions', subscaleScore: '1' }, { id: 50, subscaleName: 'Tradition_Preferred_Associates', subscaleScore: '4' }] } } }
  let(:new_results) do
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
      scores: new_score,
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

  describe '.call' do
    it 'valid results' do
      results = Hogan::NormalizeOldResults.call!(old_results.deep_stringify_keys)
      expect(results).to eq(new_results.deep_stringify_keys)
    end

    it 'empty' do
      results = Hogan::NormalizeOldResults.call!({})

      expect(results).to eq({})
    end

    it 'actually new results' do
      results = Hogan::NormalizeOldResults.call!(new_results.deep_stringify_keys)
      expect(results).to eq(new_results.deep_stringify_keys)
    end
  end
end
