# frozen_string_literal: true

require 'xmlsimple'

module Pearson
  class LoadAssessmentsToTableJob < ApplicationJob
    queue_as :low_priority

    def perform
      Pearson::LoadAssessmentsToTable.call!
    end
  end
end
