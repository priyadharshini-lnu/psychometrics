# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::Sso::ValidateClaims do
  subject(:call_service) do
    described_class.call(payload: payload, header: header, expected_audience: expected_audience,
                         application: application_user)
  end

  let(:project) { create(:project) }
  let(:application_user) { create(:application_user, tenant: project.client) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let(:expected_audience) { "#{Settings.protocol}://client.#{Settings.domain}" }
  let(:header) { { 'alg' => 'RS256', 'kid' => '1001' } }

  let(:base_payload) do
    {
      'iss' => '123',
      'aud' => expected_audience,
      'exp' => 15.minutes.from_now.to_i,
      'sub' => '42'
    }
  end

  describe '.call' do
    context 'common claim validation' do
      let(:payload) { base_payload }

      it 'returns unsupported_algorithm when alg is not RS256' do
        header['alg'] = 'HS256'

        expect(call_service[:error]).to eq(:unsupported_algorithm)
      end

      it 'returns missing_claims when sub is absent' do
        payload.delete('sub')

        expect(call_service[:error]).to eq(:missing_claims)
      end

      it 'returns ok when jti is absent and single_use is false' do
        expect(call_service[:ok]).to include('single_use' => false)
      end

      it 'returns ok when jti is absent and single_use is not set' do
        payload.delete('single_use')

        expect(call_service[:ok]).to include('single_use' => false)
      end

      it 'returns missing_jti when single_use is true and jti is absent' do
        payload['single_use'] = true

        expect(call_service[:error]).to eq(:missing_jti)
      end

      it 'returns missing_jti when single_use is true and jti is blank' do
        payload['single_use'] = true
        payload['jti'] = ' '

        expect(call_service[:error]).to eq(:missing_jti)
      end

      it 'returns ok when single_use is true and jti is present' do
        payload['single_use'] = true
        payload['jti'] = SecureRandom.uuid

        expect(call_service[:ok]).to include('single_use' => true)
      end

      it 'returns audience_mismatch when audience does not match' do
        payload['aud'] = "#{Settings.protocol}://other.#{Settings.domain}"

        expect(call_service[:error]).to eq(:audience_mismatch)
      end
    end

    context 'when ret_url is absent and tg is absent' do
      let(:payload) { base_payload }

      it 'returns ok and normalizes single_use to false' do
        expect(call_service[:ok]).to include('single_use' => false)
      end

      it 'returns ok and preserves single_use when present' do
        payload['single_use'] = true
        payload['jti'] = SecureRandom.uuid

        expect(call_service[:ok]).to include('single_use' => true)
      end
    end

    context 'when ret_url is absent but tg is present' do
      let(:payload) { base_payload.merge('tg' => 'cmp', 'tg_cmp_id' => campaign.id.to_s) }

      it 'returns ok with normalized claims for a valid cmp payload' do
        expect(call_service[:ok]).to include('tg' => 'cmp', 'single_use' => false)
      end

      it 'returns ok for a valid asmt payload' do
        payload['tg'] = 'asmt'
        payload['tg_asmt_id'] = '99'

        expect(call_service[:ok]).to include('tg' => 'asmt', 'single_use' => false)
      end

      it 'returns invalid_target when tg is unsupported' do
        payload['tg'] = 'other'

        expect(call_service[:error]).to eq(:invalid_target)
      end

      it 'returns missing_campaign_id when tg_cmp_id is blank' do
        payload['tg_cmp_id'] = nil

        expect(call_service[:error]).to eq(:missing_campaign_id)
      end

      it 'returns invalid_campaign when tg_cmp_id does not exist' do
        payload['tg_cmp_id'] = '-1'

        expect(call_service[:error]).to eq(:invalid_campaign)
      end

      it 'returns invalid_campaign_tenant when campaign belongs to a different tenant' do
        other_project = create(:project)
        other_campaign = create(:campaign, project: other_project, status: :active)
        payload['tg_cmp_id'] = other_campaign.id.to_s

        expect(call_service[:error]).to eq(:invalid_campaign_tenant)
      end

      it 'returns missing_assessment_id when tg is asmt and tg_asmt_id is absent' do
        payload['tg'] = 'asmt'

        expect(call_service[:error]).to eq(:missing_assessment_id)
      end
    end

    context 'when ret_url is present' do
      let(:payload) { base_payload.merge('ret_url' => 'https://example.com/done') }

      it 'returns missing_target when tg is absent' do
        expect(call_service[:error]).to eq(:missing_target)
      end

      it 'returns invalid_target when tg is unsupported' do
        payload['tg'] = 'other'

        expect(call_service[:error]).to eq(:invalid_target)
      end

      it 'returns missing_campaign_id when tg is present but tg_cmp_id is blank' do
        payload['tg'] = 'cmp'

        expect(call_service[:error]).to eq(:missing_campaign_id)
      end

      it 'returns invalid_campaign when tg_cmp_id does not exist' do
        payload['tg'] = 'cmp'
        payload['tg_cmp_id'] = '-1'

        expect(call_service[:error]).to eq(:invalid_campaign)
      end

      it 'returns invalid_campaign_tenant when campaign belongs to a different tenant' do
        other_project = create(:project)
        other_campaign = create(:campaign, project: other_project, status: :active)
        payload['tg'] = 'cmp'
        payload['tg_cmp_id'] = other_campaign.id.to_s

        expect(call_service[:error]).to eq(:invalid_campaign_tenant)
      end

      it 'returns missing_assessment_id when tg is asmt and tg_asmt_id is absent' do
        payload['tg'] = 'asmt'
        payload['tg_cmp_id'] = campaign.id.to_s

        expect(call_service[:error]).to eq(:missing_assessment_id)
      end

      it 'returns ok with normalized claims for a valid cmp payload' do
        payload['tg'] = 'cmp'
        payload['tg_cmp_id'] = campaign.id.to_s

        expect(call_service[:ok]).to include('tg' => 'cmp', 'single_use' => false)
      end

      it 'returns ok with normalized claims for a valid asmt payload' do
        payload['tg'] = 'asmt'
        payload['tg_cmp_id'] = campaign.id.to_s
        payload['tg_asmt_id'] = '99'

        expect(call_service[:ok]).to include('tg' => 'asmt', 'single_use' => false)
      end
    end
  end
end
