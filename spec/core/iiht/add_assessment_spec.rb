# frozen_string_literal: true

require 'rails_helper'

describe Iiht::AddAssessment do
  it 'adds iiht assement and updates iiht_user_assessment with url' do
    iiht_user_assessment = create(:iiht_user_assessment, url: nil)
    user = iiht_user_assessment.user_assessment.user
    user_assessment = iiht_user_assessment.user_assessment
    url = Faker::Internet.url
    config = { 'base_api_url' => 'https://tte-iiht.com', 'company_id' => '123' }
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
    stub_request(:get, "#{config['base_api_url']}/testAndLearnerSpecificUrl").
      with(query: {
        email: user.email,
        learnerfirstName: user.first_name,
        learnerLastName: user.last_name,
        testName: user_assessment.assessment.iiht_assessment_name,
        companyId: config['company_id']
      }).
      to_return({ body: { 'data' => url }.to_json })
    described_class.call!(user_assessment)

    expect(iiht_user_assessment.url).to eq(url)
  end
end
