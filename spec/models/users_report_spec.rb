# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersReport, type: :model do
  it { should belong_to(:user).inverse_of(:users_reports) }
  it { should belong_to(:report) }
  it { should belong_to(:campaign) }

  it { should define_enum_for(:status).with_values(not_prepared: 0, generating: 1, failed: 2, prepared: 3) }
end
