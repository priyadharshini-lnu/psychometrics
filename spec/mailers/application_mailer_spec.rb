# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationMailer, type: :mailer do
  it 'uses ProjectMailDeliveryJob as delivery job' do
    expect(described_class.delivery_job).to eq ProjectMailDeliveryJob
  end
end
