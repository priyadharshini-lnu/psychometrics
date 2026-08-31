# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::CommunicationCenter::UpdateTranslationContract do
  let(:contract) { described_class.new(schema: Api::V2::CommunicationTemplate::Schema.update_translation_request) }

  def params_for(locale:, subject: 'Subject', body: 'Body')
    jsonapi_resource_request('communication_templates', { subject: subject, body: body, locale: locale })
  end

  it 'is valid with a supported locale' do
    result = contract.call(params_for(locale: 'fr'))
    expect(result.failure?).to eq(false)
  end

  it 'rejects a locale not in I18n.available_locales' do
    result = contract.call(params_for(locale: 'not-a-locale'))
    expect(result.failure?).to eq(true)
    expect(result.errors.to_hash[:data]).to include('is not a supported locale')
  end
end
