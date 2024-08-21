# frozen_string_literal: true

module Mettl
  class CreateScheduleJob < ApplicationJob
    def perform(assessment)
      ::Mettl::CreateSchedule.call!(assessment)
    end
  end
end
