# frozen_string_literal: true

require 'rails_helper'

describe ::Clients::CopyClient do
  let(:client) { create(:project, :with_reports) }
  subject { described_class.call(client) }

  it 'creates clonned client with reports and assessments' do
    clonned_client = subject[:ok]
    expect(clonned_client.name).to eq("#{client.name} (copy)")
    expect(clonned_client.subdomain).not_to eq(client.subdomain)
    expect(clonned_client.reports).to match_array(client.reports)
    expect(clonned_client.assessments).to match_array(client.assessments)
  end

  it 'broadcast :invalid' do
    allow_any_instance_of(Client).to receive(:save).and_return(false)
    expect { subject }.to not_broadcast(:ok).and broadcast(:invalid)
  end
end
