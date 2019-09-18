# frozen_string_literal: true

class CorrectEmailScheduleData < ActiveRecord::Migration[5.1]
  def change
    Threesixty::EmailSchedule.find_each do |email_schedule|
      meta = email_schedule.meta
      meta['subject_ids'] = meta['subject_ids'].compact if meta['subject_ids'].present?
      meta['evaluator_ids'] = meta['evaluator_ids'].compact if meta['evaluator_ids'].present?

      email_schedule.update(meta: meta)
    end
  end
end
