# frozen_string_literal: true

class BackfillCommunicationEmailStatus < ActiveRecord::Migration[7.1]
  def up
    execute('UPDATE communication_emails SET status = 2 WHERE sent_at IS NOT NULL')
  end

  def down
    # No-op: we don't want to clear backfilled statuses on rollback.
  end
end
