# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::TextModuleOverrides::CreateForm do
  let(:current_user) { create(:superadmin) }
  let(:user_report) do
    create(:user_report, approved: true)
  end
  let(:module_override) { create(:text_module_override) }
  let(:attributes) { { module_id: 1, user_report_id: user_report.id, editor_id: current_user.id } }

  it 'validates presence of form' do
    form = described_class.new(attributes.merge({ report_family_id: nil }))

    expect(form.valid?).to eq(true)
  end
end
