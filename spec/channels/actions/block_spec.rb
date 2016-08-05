require 'rails_helper'
require 'channels/mock_action'

RSpec.describe Actions::Block do

  before(:all) do
    @assessment = Assessment.find(1)
    @block = create(:block)
  end

  describe '#block_create' do
    context 'when send correct request' do
      it 'create block' do
        name = "name_#{Time.now}}"
        ::MockAction.new.block_create('data' => { name: name })
        expect(Block.last.name).to eq(name)
      end
      it 'return block serializer' do
        response = ::MockAction.new.block_create('data' => { name: 'test_name' })
        expect(BlockSerializer.new(Block.last).to_hash).to eq(response[:data])
      end
    end
  end

  describe '#block_update' do
    context 'when send correct request' do
      it 'update block' do
        name = 'new_name'
        ::MockAction.new.block_update('data' => { id: @block.id, name: name }.stringify_keys)
        expect(@block.reload.name).to eq(name)
      end
    end
  end
end
