require 'rails_helper'

RSpec.describe Assessments::Mindmill, type: :model do
  it { should validate_presence_of(:name) }
  it { should validate_length_of(:name).is_at_most(150) }
  it { should validate_presence_of(:mindmill_id) }
  it { should validate_inclusion_of(:mindmill_id).in_array(Settings.providers.mindmill.assessments.map(&:id)) }
end
