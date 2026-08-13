# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'React shell notices', type: :request do
  let(:signed_in_at) { 2.days.ago.change(usec: 0) }
  let(:superadmin) { create(:superadmin, last_sign_in_at: signed_in_at) }

  def sign_in_notice_attribute
    # response.parsed_body leaves vnd.api+json as a string, so parse it here.
    JSON.parse(response.body).dig('data', 'attributes', 'sign_in_notice') # rubocop:disable Rails/ResponseParsedBody
  end

  describe 'GET /api/v2/administration/users/current_user_details' do
    it 'hands the sign-in notice to the shell exactly once' do
      login_user(superadmin)

      get '/api/v2/administration/users/current_user_details'

      expect(sign_in_notice_attribute).to eq(
        'kind' => 'last_sign_in', 'at' => Time.zone.at(signed_in_at.to_i).iso8601
      )

      get '/api/v2/administration/users/current_user_details'

      expect(sign_in_notice_attribute).to be_nil
    end

    it 'reports an unsuccessful attempt over the previous sign-in' do
      attempted_at = 3.hours.ago.change(usec: 0)
      superadmin.update!(last_unsuccessful_attempt: attempted_at)
      login_user(superadmin)

      get '/api/v2/administration/users/current_user_details'

      expect(sign_in_notice_attribute).to eq(
        'kind' => 'last_unsuccessful', 'at' => Time.zone.at(attempted_at.to_i).iso8601
      )
      expect(superadmin.reload.last_unsuccessful_attempt).to be_nil
    end

    it 'serves assessor-only users, whose shell is the same one' do
      login_user(create(:user, :assessor, last_sign_in_at: signed_in_at))

      get '/api/v2/administration/users/current_user_details'

      expect(response).to have_http_status(:ok)
      expect(sign_in_notice_attribute['kind']).to eq('last_sign_in')
    end
  end
end
