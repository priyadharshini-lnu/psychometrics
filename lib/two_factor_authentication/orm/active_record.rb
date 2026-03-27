# frozen_string_literal: true

require 'active_record'

module TwoFactorAuthentication
  module Orm
    module ActiveRecord
      module Schema
        include TwoFactorAuthentication::Schema
      end
    end
  end
end

ActiveRecord::ConnectionAdapters::Table.include TwoFactorAuthentication::Orm::ActiveRecord::Schema
ActiveRecord::ConnectionAdapters::TableDefinition.include TwoFactorAuthentication::Orm::ActiveRecord::Schema
