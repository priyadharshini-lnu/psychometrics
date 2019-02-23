require 'rails_helper'

describe Client, type: :model do
  it { should have_one(:datasheet).dependent(:destroy).with_foreign_key(:project_id) }

  describe '#hogan_group_name' do
    let(:project) { create(:project) }

    it 'should not be empty' do
      expect(project.reload.hogan_group_name).not_to be_empty
    end

    it 'should be correct' do
      expect(project.reload.hogan_group_name).to eq("#{project.client.name} - #{project.subdomain}")
    end
  end
end
