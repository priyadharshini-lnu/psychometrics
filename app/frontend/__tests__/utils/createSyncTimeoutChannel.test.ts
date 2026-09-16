import { CreateSyncTimeoutChannel } from '~/utils/createSyncTimeoutChannel'

describe('CreateSyncTimeoutChannel', () => {
  afterEach(() => {
    CreateSyncTimeoutChannel.reset()
  })

  test('delivers published messages to same-tab subscribers', () => {
    const received: Array<{ userId: number; nextTimeout: string }> = []
    CreateSyncTimeoutChannel.subscribe((msg) => received.push(msg))

    CreateSyncTimeoutChannel.publish({ userId: 42, nextTimeout: '1700000000000' })

    expect(received).toEqual([{ userId: 42, nextTimeout: '1700000000000' }])
  })

  test('supports multiple subscribers', () => {
    const first: Array<string> = []
    const second: Array<string> = []
    CreateSyncTimeoutChannel.subscribe((msg) => first.push(msg.nextTimeout))
    CreateSyncTimeoutChannel.subscribe((msg) => second.push(msg.nextTimeout))

    CreateSyncTimeoutChannel.publish({ userId: 1, nextTimeout: 'a' })
    CreateSyncTimeoutChannel.publish({ userId: 1, nextTimeout: 'b' })

    expect(first).toEqual(['a', 'b'])
    expect(second).toEqual(['a', 'b'])
  })

  test('unsubscribe stops further deliveries', () => {
    const received: Array<string> = []
    const unsubscribe = CreateSyncTimeoutChannel.subscribe((msg) => received.push(msg.nextTimeout))

    CreateSyncTimeoutChannel.publish({ userId: 1, nextTimeout: 'a' })
    unsubscribe()
    CreateSyncTimeoutChannel.publish({ userId: 1, nextTimeout: 'b' })

    expect(received).toEqual(['a'])
  })

  test('publish also broadcasts on the BroadcastChannel for other tabs', () => {
    const post = vi.fn()
    // @ts-expect-error stubbing for the test
    CreateSyncTimeoutChannel.channel = { postMessage: post }

    CreateSyncTimeoutChannel.publish({ userId: 7, nextTimeout: 'x' })

    expect(post).toHaveBeenCalledWith({ userId: 7, nextTimeout: 'x' })
  })
})
