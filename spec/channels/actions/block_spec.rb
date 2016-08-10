require 'rails_helper'
require 'channels/mock_action'

RSpec.describe Actions::Block do

   let!(:assessment) { create(:assessment) }
   let!(:block) { create(:block) }
   let!(:user) { create(:user) }

  describe '#block_create' do

    context 'when send correct request' do
      let(:name) { "name_#{Time.now}}" }
      it 'create block' do
        ::MockAction.new.block_create('data' => { name: name })
        expect(Block.last.name).to eq(name)
      end
      it 'return block serializer' do
        response = ::MockAction.new.block_create('data' => { name: name })
        expect(BlockSerializer.new(Block.last).to_hash).to eq(response[:data])
      end
    end
  end

  describe '#block_update' do
    context 'when send correct request' do
      it 'update block' do
        name = 'new_name'
        ::MockAction.new.block_update('data' => { id: block.id, name: name }.stringify_keys)
        expect(block.reload.name).to eq(name)
      end
    end
  end
end
