# frozen_string_literal: true

class CampaignStatusUpdaterJob < ApplicationJob
  # Update status of Campaigns based on start_date and end_date
  # if (status = active and now > end_date) → set status to closed
  # if (status = inactive and now > start_date and now < end_date) → set status to active
  # status: { active: 0, closed: 1, inactive: 2, archived: 3 }
  def perform
    sql = <<-SQL.squish
    UPDATE campaigns SET status = CASE
      WHEN status = 0 and NOW() at time zone 'utc' > end_date THEN 1
      WHEN status = 2 and NOW() at time zone 'utc' > start_date THEN 0
      ELSE status
    END
    WHERE
      start_date BETWEEN
        (NOW() at time zone 'utc' - INTERVAL '10 minutes')
        AND
        NOW() at time zone 'utc'
    OR
      end_date BETWEEN
        (NOW() at time zone 'utc' - INTERVAL '10 minutes')
        AND
        NOW() at time zone 'utc';
    SQL

    puts "SQL: #{sql}"

    ActiveRecord::Base.connection.execute(sql)
  end
end
