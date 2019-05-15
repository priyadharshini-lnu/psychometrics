require 'rails_helper'

RSpec.describe UsersAssessment, type: :model do
  it { should belong_to(:user).inverse_of(:users_assessments) }
  it { should belong_to(:assessment) }
  it { should belong_to(:campaign) }
end
