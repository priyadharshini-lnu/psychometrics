# frozen_string_literal: true
require 'active_support/concern'

module DeprecationsActiveRecordUpdateAttributes
  extend ActiveSupport::Concern

  def update_attributes(attrs)
    update(attrs)
  end
end

# rubocop:disable Lint/SendWithMixinArgument
ActiveRecord::Base.send(:include, DeprecationsActiveRecordUpdateAttributes)
# rubocop:enable all
