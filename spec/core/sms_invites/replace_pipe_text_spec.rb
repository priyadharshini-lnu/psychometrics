# frozen_string_literal: true

require 'rails_helper'

describe SmsInvites::ReplacePipeText do
  include Rails.application.routes.url_helpers

  let(:sms_invite) { create(:sms_invite) }

  it 'replaces {{first_name}} pipetext' do
    result = described_class.call!('Hi {{{first_name}}}', sms_invite)

    expect(result).to eq("Hi #{sms_invite.first_name}")
  end

  it 'replaces {{last_name}} pipetext' do
    result = described_class.call!('Hi {{{last_name}}}', sms_invite)

    expect(result).to eq("Hi #{sms_invite.last_name}")
  end

  it 'replaces {{invite_url}} pipetext' do
    allow(Settings).to receive(:short_url_host).and_return(nil)
    result = described_class.call!('Invite Url: {{{invite_url}}}', sms_invite)
    invite_url = shortened_url(
      domain: Settings.domain,
      host: Settings.domain,
      port: Settings.port,
      subdomain: Settings.subdomain,
      id: sms_invite.shortened_urls.last.unique_key
    )

    expect(result).to eq("Invite Url: #{invite_url}")
  end

  it 'replaces {{invite_url}} pipetext with invite_url containing short_url_host' do
    short_url_host = 'https://short_url_host.com'
    allow(Settings).to receive(:short_url_host).and_return(short_url_host)
    result = described_class.call!('Invite Url: {{{invite_url}}}', sms_invite)
    invite_url = shortened_url(
      host: short_url_host,
      id: sms_invite.shortened_urls.last.unique_key
    )

    expect(result).to eq("Invite Url: #{invite_url}")
  end

  it 'replaces multiple pipetext at once' do
    result = described_class.call!('Hi {{{first_name}}} {{{last_name}}}', sms_invite)

    expect(result).to eq("Hi #{sms_invite.first_name} #{sms_invite.last_name}")
  end
end
