# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReport, type: :model do
  it { should belong_to(:user).inverse_of(:user_reports) }
  it { should belong_to(:report) }
  it { should belong_to(:campaign) }

  it { should define_enum_for(:status).with_values(not_prepared: 0, generating: 1, failed: 2, prepared: 3) }

  context 'with :pdf_file attribute' do
    let(:user_report) { create(:user_report, :with_pdf) }

    it { expect(user_report.pdf_file.attached?).to be_truthy }
  end
end
