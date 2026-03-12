# frozen_string_literal: true

module SpeedTest
  class GenerateTestData
    CHUNK_SIZE = 64 * 1024 # 64KB chunks

    def self.call(size)
      Enumerator.new do |yielder|
        remaining = size
        chunk = Random.bytes(CHUNK_SIZE)

        while remaining.positive?
          bytes_to_send = [remaining, CHUNK_SIZE].min
          yielder << (bytes_to_send == CHUNK_SIZE ? chunk : chunk[0, bytes_to_send])
          remaining -= bytes_to_send
        end
      end
    end
  end
end
