# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('spec/fixtures/create_table_sample_migration.rb')

describe CreateTableSampleMigration do
  describe '#create_table' do
    let(:context) { described_class.new }
    let(:result) do
      ActiveRecord::Base.connection.execute(
        'SELECT * FROM test_table'
      ).first
    end
    let(:insert_record) do
      ActiveRecord::Base.connection.execute(
        "INSERT INTO test_table (test_field) VALUES ('test value')"
      )
    end

    context 'with PK_ID_START env variable' do
      before do
        ENV['PK_ID_START'] = '1000000'
        context.migrate(:up)
        insert_record
      end

      after { context.migrate(:down) }

      it 'sequences correct record id' do
        expect(result['id']).to eq(1_000_001)
      end
    end

    context 'without PK_ID_START env variable' do
      before { ENV['PK_ID_START'] = nil }

      it 'raises error' do
        expect { context.migrate(:up) }.to raise_error(
          ArgumentError, 'Please, set PK_ID_START value for primary key start.'
        )
      end
    end
  end
end
