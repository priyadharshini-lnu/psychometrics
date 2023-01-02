# frozen_string_literal: true

module ActiveRecord
  class Migration
    def create_table(table_name, comment: nil, **options)
      ENV.fetch('PK_ID_START') do
        raise(ArgumentError, 'Please, set PK_ID_START value for primary key start.')
      end

      super
      ActiveRecord::Base.connection.set_pk_sequence!(table_name, ENV['PK_ID_START'].to_i)
    end
  end
end
