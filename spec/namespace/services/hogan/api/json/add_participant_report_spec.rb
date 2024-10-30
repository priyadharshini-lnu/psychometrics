# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Services::Hogan::Api::Json::AddParticipantReport, type: :service do
  let(:context) do
    OpenStruct.new( # rubocop:disable Style/OpenStructUse
      provider: 'test_provider',
      group: 'test_group',
      participant_id: 'test_participant_id',
      report_id: 'test_report_id',
      assessment_id: 'test_assessment_id',
      norm_id: 'test_norm_id',
      language_id: 'test_language_id',
      suitability_id: 'test_suitability_id'
    )
  end

  let(:service) { described_class.new(context) }

  before do
    allow(service).to receive(:get_client_id).and_return('test_client_id')
    allow(service).to receive(:get_client_user_id).and_return('test_client_user_id')
    allow(service).to receive(:post).and_return(response)
    allow(HoganLog).to receive(:create!)
  end

  context 'when the response is successful' do
    let(:response) do
      {
        body: {
          'clientId' => 'TALENTENTERPRISETEST',
          'groupName' => 'LHXXXX-2045',
          'clientUserId' => 'tAlentUser0XX',
          'participantId' => 'UKXXXXX',
          'empId' => '1@wewewerwdsc.com',
          'messageType' => 'Information',
          'text' => 'Reports successfully added to Participant - UKXXXXX.',
          'hasSignature' => {
            'createdBy' => 'AddParticipantReports',
            'createdDate' => '2024-09-26T03:01:41.8628636-05:00',
            'producedBy' => 'HAS Standard Webservices',
            'requestedBy' => 'tAlentUser0XX',
            'requestId' => nil
          }
        },
        status: 200
      }
    end

    it 'broadcasts :ok and creates a HoganLog' do
      expect(service).to receive(:broadcast).with(:ok, response[:body])
      service.call
      expect(HoganLog).to have_received(:create!).with(
        log_type: 'AddParticipantReport',
        participant_id: context.participant_id,
        group: context.group,
        call_stack: anything,
        meta: context.to_h,
        response: response
      )
    end
  end

  context 'when the response is a failure' do
    let(:response) do
      {
        body: {
          'clientId' => 'TALENTENTERPRISETEST',
          'groupName' => 'LHXXXX-2045',
          'clientUserId' => 'tAlentUser0XX',
          'participantId' => 'UKXXXXX',
          'empId' => '1@wewewerwdsc.com',
          'messageType' => 'Alert',
          'text' => 'Client not setup to add report ID - EcHBRXXXX, assessment ID - HBRIV1 to participant UKXXXXX',
          'hasSignature' => {
            'createdBy' => 'AddParticipantReports',
            'createdDate' => '2024-09-26T03:01:36.2009542-05:00',
            'producedBy' => 'HAS Standard Webservices',
            'requestedBy' => 'tAlentUser0XX',
            'requestId' => nil
          }
        },
        status: 200
      }
    end

    context 'when the response is an alert but text contains "already has report ID"' do
      let(:response) do
        {
          body: {
            'clientId' => 'xxx_client_id',
            'groupName' => 'xxx_group_name',
            'clientUserId' => 'xxx_client_user_id',
            'participantId' => 'xxx_participant_id',
            'empId' => 'xxx@xxx.com',
            'messageType' => 'Alert',
            'text' => 'Participant ID - xxx_participant_id already has report ID - xxx_report_id',
            'hasSignature' => {
              'createdBy' => 'AddParticipantReports',
              'createdDate' => '2024-10-30T05:36:13.3460867-05:00',
              'producedBy' => 'HAS Standard Webservices',
              'requestedBy' => 'xxx_client_user_id',
              'requestId' => nil
            }
          },
          status: 200
        }
      end

      it 'broadcasts :ok and creates a HoganLog' do
        expect(service).to receive(:broadcast).with(:ok, response[:body])
        service.call

        expect(HoganLog).to have_received(:create!).with(
          log_type: 'AddParticipantReport',
          participant_id: context.participant_id,
          group: context.group,
          call_stack: anything,
          meta: context.to_h,
          response: response
        )
      end
    end

    it 'broadcasts :error and creates a HoganLog' do
      expect(service).to receive(:broadcast).with(:error, response)
      service.call

      expect(HoganLog).to have_received(:create!).with(
        log_type: 'AddParticipantReport',
        participant_id: context.participant_id,
        group: context.group,
        call_stack: anything,
        meta: context.to_h,
        response: response
      )
    end
  end
end
