require 'rails_helper'

RSpec.describe UsersReport, type: :model do
  it { should belong_to(:user) }
  it { should belong_to(:report) }
  it { should belong_to(:campaign) }

  it { should define_enum_for(:status).with_values(not_prepared: 0, prepared: 1) }
end
